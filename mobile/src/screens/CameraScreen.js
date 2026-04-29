import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Alert, ActivityIndicator, ScrollView, Platform, StatusBar } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as Print from 'expo-print';
import * as Sharing from 'expo-sharing';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '../utils/firebase';
import { collection, addDoc, doc, updateDoc, increment } from 'firebase/firestore';
import { uploadToCloudinary } from '../utils/cloudinary';
import { analyzeWasteImage } from '../utils/wasteAnalysis';
import { useApp } from '../context/AppContext';

const C = { bg:'#1A1A18', yellow:'#E8C547', orange:'#C4622D', white:'#F5F0E8', gray:'#2A2A28', card:'#252523', lightGray:'#888884', green:'#4A7C4E', blue:'#3A5A8C' };
const catColors = { dry:C.yellow, wet:C.green, metal:C.blue, plastic:C.orange, ewaste:'#9B59B6', unknown:C.lightGray };
const catIcons = { dry:'🌿', wet:'💧', metal:'⚙️', plastic:'♻️', ewaste:'💻', unknown:'🗑️' };

export default function CameraScreen() {
  const { t, user, addEcoCoins } = useApp();
  const [imageUri, setImageUri] = useState(null);
  const [cloudinaryUrl, setCloudinaryUrl] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState(null);
  const [saved, setSaved] = useState(false);

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') { Alert.alert(t('error'), 'Camera permission required.'); return; }
    const picked = await ImagePicker.launchCameraAsync({ mediaTypes: ImagePicker.MediaTypeOptions.Images, quality: 0.8 });
    if (!picked.canceled && picked.assets?.[0]) {
      const uri = picked.assets[0].uri;
      setImageUri(uri); setResult(null); setSaved(false);
      await processImage(uri);
    }
  };

  const processImage = async (uri) => {
    setUploading(true);
    let uploadedUrl = null;
    try { const up = await uploadToCloudinary(uri); uploadedUrl = up.url; setCloudinaryUrl(uploadedUrl); } catch {}
    setUploading(false); setAnalyzing(true);
    try {
      const analysis = await analyzeWasteImage(uri);
      if (analysis.success) setResult({...analysis.data, imageUrl: uploadedUrl||uri});
      else Alert.alert(t('error'), 'Analysis failed: '+analysis.error);
    } catch { Alert.alert(t('error'), 'Analysis failed. Please try again.'); }
    setAnalyzing(false);
  };

  const saveResult = async () => {
    if (!result||!user?.uid||saved) return;
    try {
      await addDoc(collection(db,'scans'), { userId:user.uid, category:result.category, itemName:result.itemName, description:result.description, confidence:result.confidence, recyclable:result.recyclable, hazardous:result.hazardous, disposalTip:result.disposalTip, ecoCoinsEarned:result.ecoCoinsEarned, imageUrl:result.imageUrl||cloudinaryUrl||imageUri, timestamp:new Date() });
      await updateDoc(doc(db,'users',user.uid), { totalScans:increment(1), co2Saved:increment(result.recyclable?0.1:0.02) });
      await addEcoCoins(result.ecoCoinsEarned, `Scanned: ${result.itemName}`);
      setSaved(true); Alert.alert(t('success'), t('savedSuccess'));
    } catch { Alert.alert(t('error'), 'Failed to save. Check your connection.'); }
  };

  const generatePDF = async () => {
    if (!result) return;
    const html = `<!DOCTYPE html><html><head><meta charset="UTF-8"><style>body{font-family:Arial;background:#1A1A18;color:#F5F0E8;padding:40px}.logo{font-size:42px;font-weight:900;letter-spacing:6px}.badge{display:inline-block;background:${catColors[result.category]||'#888'};color:#1A1A18;padding:8px 24px;border-radius:30px;font-weight:900;font-size:16px;letter-spacing:3px}.section{background:#252523;border-radius:12px;padding:20px;margin:12px 0;border-left:4px solid #E8C547}.row{display:flex;justify-content:space-between;padding:8px 0;border-bottom:1px solid #333}.label{color:#888884;font-size:13px}.value{color:#F5F0E8;font-size:13px;font-weight:700}.coins{text-align:center;background:#2A2A00;border-radius:12px;padding:20px;margin:12px 0;border:2px solid #E8C547}.coins-val{font-size:48px;font-weight:900;color:#E8C547}</style></head>
<body><div class="logo">SMART<span style="background:#E8C547;color:#1A1A18;padding:0 10px">BIN</span></div><p style="color:#888;font-size:12px;letter-spacing:4px">BY TEAM LEAVRON — WASTE ANALYSIS REPORT</p>
${result.imageUrl?`<img src="${result.imageUrl}" style="max-width:300px;max-height:250px;border-radius:12px;border:2px solid #E8C547;display:block;margin:16px auto"/>`:''}
<div style="text-align:center;margin:16px 0"><span class="badge">${(result.category||'unknown').toUpperCase()} WASTE</span></div>
<div class="section"><h3 style="color:#E8C547;font-size:12px;letter-spacing:3px">ANALYSIS DETAILS</h3>
<div class="row"><span class="label">Item</span><span class="value">${result.itemName}</span></div>
<div class="row"><span class="label">Confidence</span><span class="value">${result.confidence}%</span></div>
<div class="row"><span class="label">Recyclable</span><span class="value" style="color:${result.recyclable?'#4CAF50':'#E74C3C'}">${result.recyclable?'✓ YES':'✗ NO'}</span></div>
<div class="row"><span class="label">Date</span><span class="value">${new Date().toLocaleString()}</span></div></div>
<div class="section"><p>${result.description}</p></div>
<div class="section" style="border-left-color:#4A7C4E"><p style="color:#4A7C4E;font-size:11px;letter-spacing:3px;margin-bottom:8px">💡 DISPOSAL TIP</p><p>${result.disposalTip}</p></div>
${result.hazardous?`<p style="color:#FF9800;text-align:center">⚠️ HAZARDOUS — Handle with care</p>`:''}
<div class="coins"><div class="coins-val">+${result.ecoCoinsEarned}</div><div style="color:#888;font-size:12px;letter-spacing:3px">ECOCOINS EARNED</div></div>
<p style="text-align:center;color:#888;font-size:11px">SmartBin by Team Leavron | AI-Powered Waste Management</p>
</body></html>`;
    try {
      const { uri } = await Print.printToFileAsync({ html, base64:false });
      if (await Sharing.isAvailableAsync()) await Sharing.shareAsync(uri, { mimeType:'application/pdf', dialogTitle:'SmartBin Report' });
      else Alert.alert(t('success'), 'PDF saved: '+uri);
    } catch(err) { Alert.alert(t('error'), 'PDF failed: '+err.message); }
  };

  const resetScan = () => { setImageUri(null); setCloudinaryUrl(null); setResult(null); setSaved(false); };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg}/>
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.header}><Text style={s.headerTitle}>{t('scanWaste')}</Text><Text style={s.headerSub}>AI-powered waste classification</Text></View>

        {!imageUri ? (
          <View style={s.cameraPlaceholder}>
            <View style={s.scanRing}><View style={s.scanRingInner}><Text style={s.scanIcon}>📷</Text><Text style={s.tapText}>{t('tapToCapture')}</Text></View></View>
            <TouchableOpacity style={s.openCameraBtn} onPress={openCamera}>
              <LinearGradient colors={[C.yellow,C.orange]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.openCameraGradient}>
                <Text style={s.openCameraBtnText}>📷  {t('openCamera')}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </View>
        ) : (
          <View style={s.imageContainer}>
            <Image source={{uri:imageUri}} style={s.capturedImage} resizeMode="cover"/>
            {(uploading||analyzing)&&<View style={s.analyzeOverlay}><ActivityIndicator size="large" color={C.yellow}/><Text style={s.analyzeText}>{uploading?t('uploadingImage'):t('analyzing')}</Text></View>}
          </View>
        )}

        {result&&!analyzing&&(
          <View style={s.resultContainer}>
            <LinearGradient colors={[(catColors[result.category]||C.lightGray)+'CC',C.card]} style={s.categoryBanner}>
              <Text style={s.categoryIcon}>{catIcons[result.category]||'🗑️'}</Text>
              <View><Text style={s.categoryLabel}>{t('category')}</Text><Text style={s.categoryValue}>{result.category?.toUpperCase()} WASTE</Text></View>
              <View style={s.confidenceBadge}><Text style={s.confidenceText}>{result.confidence}%</Text><Text style={s.confidenceLabel}>match</Text></View>
            </LinearGradient>

            <View style={s.infoCard}><Text style={s.infoCardTitle}>{result.itemName}</Text><Text style={s.infoCardDesc}>{result.description}</Text></View>

            <View style={s.badgesRow}>
              <View style={[s.badge,{backgroundColor:result.recyclable?'#1A3A1F':'#3A1A1A'}]}><Text style={[s.badgeText,{color:result.recyclable?'#4CAF50':'#E74C3C'}]}>{result.recyclable?`✓ ${t('recyclable')}`:`✗ ${t('notRecyclable')}`}</Text></View>
              {result.hazardous&&<View style={[s.badge,{backgroundColor:'#3A1A00'}]}><Text style={[s.badgeText,{color:'#FF9800'}]}>⚠️ {t('hazardous')}</Text></View>}
            </View>

            <View style={s.tipCard}><Text style={s.tipLabel}>💡 {t('disposalTip')}</Text><Text style={s.tipText}>{result.disposalTip}</Text></View>
            <View style={s.coinsCard}><Text style={s.coinsValue}>+{result.ecoCoinsEarned}</Text><Text style={s.coinsLabel}>{t('coinsEarned')}</Text></View>

            <View style={s.actionsRow}>
              {!saved ? (
                <TouchableOpacity style={s.saveBtn} onPress={saveResult}>
                  <LinearGradient colors={[C.yellow,C.orange]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.saveBtnGradient}><Text style={s.saveBtnText}>💾 {t('saveResult')}</Text></LinearGradient>
                </TouchableOpacity>
              ) : <View style={s.savedBadge}><Text style={s.savedBadgeText}>✓ Saved</Text></View>}
              <TouchableOpacity style={s.pdfBtn} onPress={generatePDF}><Text style={s.pdfBtnText}>📄 {t('downloadPDF')}</Text></TouchableOpacity>
            </View>
            <TouchableOpacity style={s.scanAgainBtn} onPress={resetScan}><Text style={s.scanAgainText}>🔄 {t('scanAgain')}</Text></TouchableOpacity>
          </View>
        )}
        <View style={{height:100}}/>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:C.bg},
  header:{padding:24,paddingTop:Platform.OS==='android'?50:60},
  headerTitle:{color:C.white,fontSize:28,fontWeight:'900',letterSpacing:2}, headerSub:{color:C.lightGray,fontSize:12,marginTop:4},
  cameraPlaceholder:{padding:24,alignItems:'center'},
  scanRing:{width:220,height:220,borderRadius:110,borderWidth:3,borderColor:C.yellow,borderStyle:'dashed',alignItems:'center',justifyContent:'center',marginBottom:30},
  scanRingInner:{alignItems:'center',gap:8}, scanIcon:{fontSize:56}, tapText:{color:C.lightGray,fontSize:14,textAlign:'center'},
  openCameraBtn:{width:'100%',borderRadius:14,overflow:'hidden'}, openCameraGradient:{padding:18,alignItems:'center'}, openCameraBtnText:{color:C.bg,fontSize:17,fontWeight:'800'},
  imageContainer:{marginHorizontal:16,borderRadius:16,overflow:'hidden',position:'relative'}, capturedImage:{width:'100%',height:280},
  analyzeOverlay:{position:'absolute',top:0,left:0,right:0,bottom:0,backgroundColor:'rgba(0,0,0,0.7)',alignItems:'center',justifyContent:'center',gap:12},
  analyzeText:{color:C.yellow,fontSize:16,fontWeight:'600'},
  resultContainer:{padding:16,gap:12},
  categoryBanner:{borderRadius:16,padding:20,flexDirection:'row',alignItems:'center',gap:16},
  categoryIcon:{fontSize:48}, categoryLabel:{color:'rgba(255,255,255,0.7)',fontSize:11,letterSpacing:2}, categoryValue:{color:C.white,fontSize:22,fontWeight:'900',letterSpacing:2},
  confidenceBadge:{marginLeft:'auto',alignItems:'center'}, confidenceText:{color:C.white,fontSize:28,fontWeight:'900'}, confidenceLabel:{color:'rgba(255,255,255,0.7)',fontSize:11},
  infoCard:{backgroundColor:C.card,borderRadius:14,padding:16}, infoCardTitle:{color:C.white,fontSize:18,fontWeight:'700',marginBottom:8}, infoCardDesc:{color:C.lightGray,fontSize:14,lineHeight:20},
  badgesRow:{flexDirection:'row',gap:10}, badge:{paddingHorizontal:14,paddingVertical:10,borderRadius:10}, badgeText:{fontSize:13,fontWeight:'700'},
  tipCard:{backgroundColor:'#1A2A1F',borderRadius:14,padding:16,borderLeftWidth:4,borderLeftColor:C.green}, tipLabel:{color:C.green,fontSize:12,fontWeight:'700',letterSpacing:1,marginBottom:8}, tipText:{color:C.white,fontSize:14,lineHeight:20},
  coinsCard:{backgroundColor:'#2A2800',borderRadius:14,padding:20,alignItems:'center',borderWidth:2,borderColor:C.yellow},
  coinsValue:{color:C.yellow,fontSize:48,fontWeight:'900'}, coinsLabel:{color:C.lightGray,fontSize:12,letterSpacing:2,marginTop:4},
  actionsRow:{flexDirection:'row',gap:10},
  saveBtn:{flex:1,borderRadius:12,overflow:'hidden'}, saveBtnGradient:{padding:16,alignItems:'center'}, saveBtnText:{color:C.bg,fontSize:15,fontWeight:'700'},
  savedBadge:{flex:1,backgroundColor:'#1A3A1F',borderRadius:12,padding:16,alignItems:'center'}, savedBadgeText:{color:'#4CAF50',fontSize:15,fontWeight:'700'},
  pdfBtn:{flex:1,backgroundColor:C.card,borderRadius:12,padding:16,alignItems:'center',borderWidth:1,borderColor:C.lightGray}, pdfBtnText:{color:C.white,fontSize:14,fontWeight:'600'},
  scanAgainBtn:{backgroundColor:C.gray,borderRadius:12,padding:16,alignItems:'center',borderWidth:1,borderColor:'#444'}, scanAgainText:{color:C.white,fontSize:15,fontWeight:'600'},
});
