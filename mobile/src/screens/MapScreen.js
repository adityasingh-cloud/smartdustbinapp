import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Linking, Platform, StatusBar, ActivityIndicator } from 'react-native';
import MapView, { Marker, Circle } from 'react-native-maps';
import * as Location from 'expo-location';
import { db } from '../utils/firebase';
import { collection, onSnapshot } from 'firebase/firestore';
import { useApp } from '../context/AppContext';

const C = { bg:'#1A1A18', yellow:'#E8C547', orange:'#C4622D', white:'#F5F0E8', gray:'#2A2A28', card:'#252523', lightGray:'#888884', green:'#4A7C4E', blue:'#3A5A8C' };

const darkMapStyle = [
  {elementType:'geometry',stylers:[{color:'#1A1A18'}]},
  {elementType:'labels.text.fill',stylers:[{color:'#888884'}]},
  {elementType:'labels.text.stroke',stylers:[{color:'#1A1A18'}]},
  {featureType:'road',elementType:'geometry',stylers:[{color:'#2A2A28'}]},
  {featureType:'road',elementType:'geometry.stroke',stylers:[{color:'#1A1A18'}]},
  {featureType:'water',elementType:'geometry',stylers:[{color:'#17263c'}]},
  {featureType:'poi',elementType:'geometry',stylers:[{color:'#252523'}]},
];

export default function MapScreen() {
  const { t } = useApp();
  const [userLocation, setUserLocation] = useState(null);
  const [bins, setBins] = useState([]);
  const [selectedBin, setSelectedBin] = useState(null);
  const [loading, setLoading] = useState(true);
  const [permissionDenied, setPermissionDenied] = useState(false);

  useEffect(() => {
    getLocation();
    const unsubscribe = onSnapshot(collection(db,'bins'), (snap) => {
      setBins(snap.docs.map(d=>({id:d.id,...d.data()})));
      setLoading(false);
    }, () => setLoading(false));
    return () => unsubscribe();
  }, []);

  const getLocation = async () => {
    const { status } = await Location.requestForegroundPermissionsAsync();
    if (status !== 'granted') { setPermissionDenied(true); setLoading(false); return; }
    const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
    setUserLocation({ latitude:loc.coords.latitude, longitude:loc.coords.longitude, latitudeDelta:0.02, longitudeDelta:0.02 });
  };

  const getDirections = (bin) => {
    const scheme = Platform.select({ ios:`maps:0,0?q=${bin.latitude},${bin.longitude}`, android:`geo:0,0?q=${bin.latitude},${bin.longitude}(SmartBin)` });
    Linking.openURL(scheme);
  };

  const getFillColor = (l) => l>=80?'#E74C3C':l>=60?C.orange:l>=40?C.yellow:C.green;

  const getDistanceKm = (bin) => {
    if (!userLocation) return null;
    const R=6371, dLat=((bin.latitude-userLocation.latitude)*Math.PI)/180, dLon=((bin.longitude-userLocation.longitude)*Math.PI)/180;
    const a=Math.sin(dLat/2)*Math.sin(dLat/2)+Math.cos((userLocation.latitude*Math.PI)/180)*Math.cos((bin.latitude*Math.PI)/180)*Math.sin(dLon/2)*Math.sin(dLon/2);
    return (R*2*Math.atan2(Math.sqrt(a),Math.sqrt(1-a))).toFixed(2);
  };

  const mapRegion = userLocation||{latitude:22.5726,longitude:88.3639,latitudeDelta:0.05,longitudeDelta:0.05};

  if (permissionDenied) return (
    <View style={s.centerContainer}>
      <Text style={s.permissionText}>📍 {t('locationPermission')}</Text>
      <TouchableOpacity style={s.retryBtn} onPress={getLocation}><Text style={s.retryText}>{t('retry')}</Text></TouchableOpacity>
    </View>
  );

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg}/>
      <View style={s.header}>
        <Text style={s.headerTitle}>{t('binLocations')}</Text>
        <Text style={s.headerSub}>{bins.length} bins live</Text>
      </View>
      <View style={s.mapContainer}>
        <MapView style={s.map} region={mapRegion} showsUserLocation showsMyLocationButton mapType="standard" customMapStyle={darkMapStyle}>
          {bins.map(bin=>(
            <Marker key={bin.id} coordinate={{latitude:bin.latitude,longitude:bin.longitude}} onPress={()=>setSelectedBin(bin)} pinColor={getFillColor(bin.fillLevel||0)}>
              <View style={[s.markerContainer,{borderColor:getFillColor(bin.fillLevel||0)}]}>
                <Text style={s.markerText}>🗑️</Text>
                <Text style={[s.markerLevel,{color:getFillColor(bin.fillLevel||0)}]}>{bin.fillLevel||0}%</Text>
              </View>
            </Marker>
          ))}
          {userLocation&&<Circle center={userLocation} radius={500} fillColor="rgba(232,197,71,0.1)" strokeColor="rgba(232,197,71,0.3)" strokeWidth={1}/>}
        </MapView>
        {loading&&<View style={s.mapLoading}><ActivityIndicator color={C.yellow}/></View>}
      </View>

      {selectedBin&&(
        <View style={s.binDetail}>
          <View style={s.binDetailHeader}>
            <Text style={s.binDetailName}>{selectedBin.name||'SmartBin'}</Text>
            <TouchableOpacity onPress={()=>setSelectedBin(null)}><Text style={s.closeBtn}>✕</Text></TouchableOpacity>
          </View>
          <Text style={s.binDetailAddress}>{selectedBin.address||''}</Text>
          <View style={s.binDetailStats}>
            <View style={s.binDetailStat}><Text style={s.binDetailStatLabel}>{t('fillLevel')}</Text><Text style={[s.binDetailStatValue,{color:getFillColor(selectedBin.fillLevel||0)}]}>{selectedBin.fillLevel||0}%</Text></View>
            {userLocation&&<View style={s.binDetailStat}><Text style={s.binDetailStatLabel}>{t('distance')}</Text><Text style={s.binDetailStatValue}>{getDistanceKm(selectedBin)} km</Text></View>}
            <View style={s.binDetailStat}><Text style={s.binDetailStatLabel}>{t('lastUpdated')}</Text><Text style={s.binDetailStatValue}>{selectedBin.updatedAt?.toDate?.()?.toLocaleTimeString?.()||'N/A'}</Text></View>
          </View>
          <View style={s.fillBars}>
            {['dry','wet','metal'].map(type=>(
              <View key={type} style={s.fillBarItem}>
                <Text style={s.fillBarLabel}>{t(type)}</Text>
                <View style={s.fillBarTrack}><View style={[s.fillBarFill,{width:`${selectedBin[type]||0}%`,backgroundColor:type==='dry'?C.yellow:type==='wet'?C.green:C.blue}]}/></View>
                <Text style={s.fillBarPercent}>{selectedBin[type]||0}%</Text>
              </View>
            ))}
          </View>
          <TouchableOpacity style={s.directionsBtn} onPress={()=>getDirections(selectedBin)}><Text style={s.directionsBtnText}>🗺️ {t('getDirections')}</Text></TouchableOpacity>
        </View>
      )}

      {!selectedBin&&bins.length>0&&(
        <View style={s.nearbyList}>
          <Text style={s.nearbyTitle}>{t('nearbyBins')}</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false}>
            {bins.slice(0,5).map(bin=>(
              <TouchableOpacity key={bin.id} style={s.nearbyCard} onPress={()=>setSelectedBin(bin)}>
                <Text style={s.nearbyCardName}>{bin.name||'SmartBin'}</Text>
                <Text style={[s.nearbyCardLevel,{color:getFillColor(bin.fillLevel||0)}]}>{bin.fillLevel||0}% {t('full')}</Text>
                {userLocation&&<Text style={s.nearbyCardDist}>{getDistanceKm(bin)} km</Text>}
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:C.bg},
  centerContainer:{flex:1,backgroundColor:C.bg,alignItems:'center',justifyContent:'center',gap:16},
  header:{padding:24,paddingTop:Platform.OS==='android'?50:60,flexDirection:'row',justifyContent:'space-between',alignItems:'center'},
  headerTitle:{color:C.white,fontSize:24,fontWeight:'900'}, headerSub:{color:C.lightGray,fontSize:13},
  mapContainer:{flex:1,position:'relative'}, map:{flex:1},
  mapLoading:{position:'absolute',top:'50%',left:'50%',marginLeft:-20,marginTop:-20},
  markerContainer:{backgroundColor:C.bg,borderRadius:12,padding:8,alignItems:'center',borderWidth:2,minWidth:56},
  markerText:{fontSize:20}, markerLevel:{fontSize:11,fontWeight:'700',marginTop:2},
  binDetail:{backgroundColor:C.gray,borderTopLeftRadius:24,borderTopRightRadius:24,padding:20,maxHeight:360},
  binDetailHeader:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:4},
  binDetailName:{color:C.white,fontSize:18,fontWeight:'700'}, closeBtn:{color:C.lightGray,fontSize:18,padding:4},
  binDetailAddress:{color:C.lightGray,fontSize:12,marginBottom:16},
  binDetailStats:{flexDirection:'row',gap:10,marginBottom:16},
  binDetailStat:{flex:1,backgroundColor:C.card,borderRadius:10,padding:12,alignItems:'center'},
  binDetailStatLabel:{color:C.lightGray,fontSize:10,marginBottom:4}, binDetailStatValue:{color:C.white,fontSize:15,fontWeight:'700'},
  fillBars:{gap:8,marginBottom:16},
  fillBarItem:{flexDirection:'row',alignItems:'center',gap:8},
  fillBarLabel:{color:C.lightGray,fontSize:12,width:36},
  fillBarTrack:{flex:1,height:8,backgroundColor:'#333',borderRadius:4,overflow:'hidden'}, fillBarFill:{height:'100%',borderRadius:4},
  fillBarPercent:{color:C.white,fontSize:12,fontWeight:'600',width:32,textAlign:'right'},
  directionsBtn:{backgroundColor:C.yellow,borderRadius:12,padding:14,alignItems:'center'}, directionsBtnText:{color:C.bg,fontSize:15,fontWeight:'700'},
  nearbyList:{backgroundColor:C.gray,paddingVertical:16,paddingHorizontal:20},
  nearbyTitle:{color:C.white,fontSize:14,fontWeight:'700',marginBottom:10},
  nearbyCard:{backgroundColor:C.card,borderRadius:12,padding:14,marginRight:10,minWidth:120,borderWidth:1,borderColor:'#444'},
  nearbyCardName:{color:C.white,fontSize:13,fontWeight:'600',marginBottom:4}, nearbyCardLevel:{fontSize:12,fontWeight:'700',marginBottom:2}, nearbyCardDist:{color:C.lightGray,fontSize:11},
  permissionText:{color:C.white,fontSize:16,textAlign:'center',paddingHorizontal:40},
  retryBtn:{backgroundColor:C.yellow,borderRadius:12,paddingHorizontal:24,paddingVertical:12}, retryText:{color:C.bg,fontWeight:'700'},
});
