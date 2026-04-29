import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Alert, ActivityIndicator, Modal, StatusBar, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useApp } from '../context/AppContext';
import { LANGUAGES } from '../utils/translations';

const C = { bg:'#1A1A18', yellow:'#E8C547', orange:'#C4622D', white:'#F5F0E8', gray:'#2A2A28', card:'#252523', lightGray:'#888884', green:'#4A7C4E', blue:'#3A5A8C' };

export default function ProfileScreen() {
  const { t, userProfile, ecoCoins, totalScans, updateUserProfile, logoutUser, language, setLanguage } = useApp();
  const [editing, setEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [form, setForm] = useState({ name:userProfile?.name||'', phone:userProfile?.phone||'', email:userProfile?.email||'', state:userProfile?.state||'', city:userProfile?.city||'', pincode:userProfile?.pincode||'' });

  const startEdit = () => { setForm({ name:userProfile?.name||'', phone:userProfile?.phone||'', email:userProfile?.email||'', state:userProfile?.state||'', city:userProfile?.city||'', pincode:userProfile?.pincode||'' }); setEditing(true); };

  const saveProfile = async () => {
    if (!form.name.trim()) { Alert.alert(t('error'), 'Name cannot be empty'); return; }
    setSaving(true);
    try { await updateUserProfile({ name:form.name.trim(), phone:form.phone.trim(), email:form.email.trim(), state:form.state.trim(), city:form.city.trim(), pincode:form.pincode.trim() }); setEditing(false); Alert.alert(t('success'), t('profileUpdated')); }
    catch { Alert.alert(t('error'), t('updateFailed')); }
    setSaving(false);
  };

  const handleLogout = () => Alert.alert(t('logout'), 'Are you sure?', [{ text:t('cancel'), style:'cancel' }, { text:t('logout'), onPress:logoutUser, style:'destructive' }]);
  const getInitials = (n) => !n ? 'U' : n.split(' ').map(w=>w[0]).join('').toUpperCase().slice(0,2);
  const getLevel = (s) => s>=500?{level:10,title:'Eco Master'}:s>=200?{level:7,title:'Green Champion'}:s>=100?{level:5,title:'Eco Warrior'}:s>=50?{level:3,title:'Eco Starter'}:{level:1,title:'New Member'};
  const levelInfo = getLevel(totalScans);
  const memberSince = userProfile?.createdAt ? new Date(userProfile.createdAt).getFullYear() : new Date().getFullYear();
  const ACHIEVEMENTS = [
    {icon:'🌱',title:'First Scan',done:totalScans>=1},{icon:'🔟',title:'10 Scans',done:totalScans>=10},
    {icon:'💯',title:'100 Scans',done:totalScans>=100},{icon:'🪙',title:'100 EcoCoins',done:ecoCoins>=100},
    {icon:'♻️',title:'Recycler',done:totalScans>=20},{icon:'🌍',title:'Eco Hero',done:totalScans>=50},
  ];
  const FIELDS = [{key:'name',label:t('name'),kb:'default'},{key:'phone',label:t('phone'),kb:'phone-pad'},{key:'email',label:t('email'),kb:'email-address'},{key:'state',label:t('state'),kb:'default'},{key:'city',label:t('city'),kb:'default'},{key:'pincode',label:t('pincode'),kb:'numeric'}];

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg}/>
      <ScrollView showsVerticalScrollIndicator={false}>
        <LinearGradient colors={['#2A2A28',C.bg]} style={s.header}>
          <View style={s.headerRow}>
            <Text style={s.headerTitle}>{t('me')}</Text>
            <View style={s.headerActions}>
              <TouchableOpacity onPress={()=>setShowLangModal(true)} style={s.langBtn}><Text style={s.langBtnText}>🌐</Text></TouchableOpacity>
              {!editing ? <TouchableOpacity onPress={startEdit} style={s.editBtn}><Text style={s.editBtnText}>{t('editProfile')}</Text></TouchableOpacity>
                : <TouchableOpacity onPress={()=>setEditing(false)} style={s.cancelBtn}><Text style={s.cancelBtnText}>{t('cancel')}</Text></TouchableOpacity>}
            </View>
          </View>
          <View style={s.avatarArea}>
            <View style={s.avatar}><Text style={s.avatarText}>{getInitials(userProfile?.name)}</Text></View>
            <View style={s.levelBadge}><Text style={s.levelBadgeText}>LVL {levelInfo.level}</Text></View>
          </View>
          <Text style={s.profileName}>{userProfile?.name||'User'}</Text>
          <Text style={s.profileTitle}>{levelInfo.title}</Text>
          <Text style={s.memberSince}>{t('memberSince')} {memberSince}</Text>
        </LinearGradient>

        <View style={s.quickStats}>
          {[{v:totalScans,l:t('totalScans'),c:C.white},{v:ecoCoins,l:t('ecoCoins'),c:C.yellow},{v:(userProfile?.co2Saved||0).toFixed(1),l:`${t('co2Saved')} (kg)`,c:C.green}].map((st,i)=>(
            <View key={i} style={s.quickStat}><Text style={[s.quickStatValue,{color:st.c}]}>{st.v}</Text><Text style={s.quickStatLabel}>{st.l}</Text></View>
          ))}
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>Profile Information</Text>
          <View style={s.formCard}>
            {FIELDS.map(({key,label,kb})=>(
              <View key={key} style={s.fieldRow}>
                <Text style={s.fieldLabel}>{label}</Text>
                {editing ? <TextInput style={s.fieldInput} value={form[key]} onChangeText={(v)=>setForm(p=>({...p,[key]:v}))} placeholderTextColor={C.lightGray} placeholder={`Enter ${label}`} keyboardType={kb} autoCapitalize={key==='email'?'none':'words'}/>
                  : <Text style={s.fieldValue}>{userProfile?.[key]||<Text style={{color:C.lightGray}}>Not set</Text>}</Text>}
              </View>
            ))}
            <View style={s.fieldRow}>
              <Text style={s.fieldLabel}>{t('language')}</Text>
              <TouchableOpacity onPress={()=>setShowLangModal(true)}><Text style={[s.fieldValue,{color:C.yellow}]}>{LANGUAGES.find(l=>l.code===language)?.nativeName} ›</Text></TouchableOpacity>
            </View>
            {editing&&<TouchableOpacity style={s.saveBtn} onPress={saveProfile} disabled={saving}>
              <LinearGradient colors={[C.yellow,C.orange]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.saveBtnGradient}>
                {saving ? <ActivityIndicator color={C.bg}/> : <Text style={s.saveBtnText}>{t('save')}</Text>}
              </LinearGradient>
            </TouchableOpacity>}
          </View>
        </View>

        <View style={s.section}>
          <Text style={s.sectionTitle}>{t('achievements')}</Text>
          <View style={s.achievementsGrid}>
            {ACHIEVEMENTS.map((a,i)=>(
              <View key={i} style={[s.achievementItem,!a.done&&s.achievementLocked]}>
                <Text style={[s.achievementIcon,!a.done&&{opacity:0.3}]}>{a.icon}</Text>
                <Text style={[s.achievementTitle,!a.done&&{color:C.lightGray}]}>{a.title}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={{padding:16,paddingBottom:100}}>
          <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}><Text style={s.logoutText}>{t('logout')}</Text></TouchableOpacity>
        </View>
      </ScrollView>

      <Modal visible={showLangModal} transparent animationType="slide">
        <View style={s.modalOverlay}>
          <View style={s.langModal}>
            <Text style={s.langModalTitle}>{t('selectLanguage')}</Text>
            {LANGUAGES.map(lang=>(
              <TouchableOpacity key={lang.code} style={[s.langOption,language===lang.code&&s.langOptionActive]} onPress={()=>{setLanguage(lang.code);setShowLangModal(false);}}>
                <Text style={s.langOptionNative}>{lang.nativeName}</Text>
                <Text style={s.langOptionName}>{lang.name}</Text>
                {language===lang.code&&<Text style={s.langCheck}>✓</Text>}
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.langCloseBtn} onPress={()=>setShowLangModal(false)}><Text style={s.langCloseBtnText}>{t('close')}</Text></TouchableOpacity>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:C.bg},
  header:{padding:24,paddingTop:Platform.OS==='android'?50:60},
  headerRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',marginBottom:20},
  headerTitle:{color:C.white,fontSize:24,fontWeight:'900'},
  headerActions:{flexDirection:'row',gap:10,alignItems:'center'},
  langBtn:{backgroundColor:C.gray,borderRadius:20,padding:8}, langBtnText:{fontSize:18},
  editBtn:{backgroundColor:C.yellow,borderRadius:20,paddingHorizontal:16,paddingVertical:8}, editBtnText:{color:C.bg,fontSize:13,fontWeight:'700'},
  cancelBtn:{backgroundColor:C.gray,borderRadius:20,paddingHorizontal:16,paddingVertical:8}, cancelBtnText:{color:C.lightGray,fontSize:13},
  avatarArea:{alignItems:'center',position:'relative'},
  avatar:{width:80,height:80,borderRadius:40,backgroundColor:C.yellow,alignItems:'center',justifyContent:'center',borderWidth:3,borderColor:C.orange},
  avatarText:{color:C.bg,fontSize:28,fontWeight:'900'},
  levelBadge:{position:'absolute',bottom:-8,right:'35%',backgroundColor:C.orange,borderRadius:10,paddingHorizontal:10,paddingVertical:3},
  levelBadgeText:{color:C.white,fontSize:10,fontWeight:'800'},
  profileName:{color:C.white,fontSize:24,fontWeight:'800',textAlign:'center',marginTop:16},
  profileTitle:{color:C.yellow,fontSize:14,textAlign:'center',marginTop:4},
  memberSince:{color:C.lightGray,fontSize:12,textAlign:'center',marginTop:4},
  quickStats:{flexDirection:'row',marginHorizontal:16,marginTop:16,backgroundColor:C.card,borderRadius:16,padding:16},
  quickStat:{flex:1,alignItems:'center'}, quickStatValue:{color:C.white,fontSize:20,fontWeight:'800'}, quickStatLabel:{color:C.lightGray,fontSize:10,marginTop:4,textAlign:'center'},
  section:{padding:16,paddingBottom:0}, sectionTitle:{color:C.white,fontSize:16,fontWeight:'700',marginBottom:10,letterSpacing:1},
  formCard:{backgroundColor:C.card,borderRadius:16,overflow:'hidden'},
  fieldRow:{flexDirection:'row',justifyContent:'space-between',alignItems:'center',padding:16,borderBottomWidth:0.5,borderBottomColor:'#333'},
  fieldLabel:{color:C.lightGray,fontSize:13,flex:1}, fieldValue:{color:C.white,fontSize:14,fontWeight:'600',flex:2,textAlign:'right'},
  fieldInput:{flex:2,color:C.white,fontSize:14,textAlign:'right',backgroundColor:'#333',borderRadius:8,paddingHorizontal:10,paddingVertical:6},
  saveBtn:{margin:16,borderRadius:12,overflow:'hidden'}, saveBtnGradient:{padding:14,alignItems:'center'}, saveBtnText:{color:C.bg,fontSize:15,fontWeight:'700'},
  achievementsGrid:{flexDirection:'row',flexWrap:'wrap',gap:10},
  achievementItem:{backgroundColor:C.card,borderRadius:12,padding:14,width:'30.5%',alignItems:'center',borderWidth:1,borderColor:C.yellow+'44'},
  achievementLocked:{borderColor:'#333'}, achievementIcon:{fontSize:28,marginBottom:6}, achievementTitle:{color:C.white,fontSize:11,textAlign:'center',fontWeight:'600'},
  logoutBtn:{backgroundColor:'#3A1A1A',borderRadius:14,padding:16,alignItems:'center',borderWidth:1,borderColor:'#E74C3C44'}, logoutText:{color:'#E74C3C',fontSize:15,fontWeight:'700'},
  modalOverlay:{flex:1,backgroundColor:'rgba(0,0,0,0.7)',justifyContent:'flex-end'},
  langModal:{backgroundColor:C.gray,borderTopLeftRadius:24,borderTopRightRadius:24,padding:24},
  langModalTitle:{color:C.white,fontSize:18,fontWeight:'700',marginBottom:16,textAlign:'center'},
  langOption:{flexDirection:'row',alignItems:'center',padding:16,borderRadius:12,marginBottom:8,backgroundColor:C.card},
  langOptionActive:{backgroundColor:'#2A2800',borderWidth:1,borderColor:C.yellow},
  langOptionNative:{color:C.white,fontSize:16,fontWeight:'700',flex:1}, langOptionName:{color:C.lightGray,fontSize:13},
  langCheck:{color:C.yellow,fontSize:18,fontWeight:'700'},
  langCloseBtn:{marginTop:8,padding:14,alignItems:'center'}, langCloseBtnText:{color:C.lightGray,fontSize:14},
});
