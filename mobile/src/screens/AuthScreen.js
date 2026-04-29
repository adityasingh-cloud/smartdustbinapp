import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Alert, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView, StatusBar } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { db } from '../utils/firebase';
import { doc, setDoc, getDoc } from 'firebase/firestore';
import { useApp } from '../context/AppContext';
import { LANGUAGES } from '../utils/translations';

const C = { bg:'#1A1A18', yellow:'#E8C547', orange:'#C4622D', white:'#F5F0E8', gray:'#3A3A38', lightGray:'#888884' };

export default function AuthScreen() {
  const { loginUser, t, language, setLanguage } = useApp();
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLangPicker, setShowLangPicker] = useState(false);

  const generateUID = () => 'user_'+Date.now()+'_'+Math.random().toString(36).substr(2,9);

  const handleAuth = async () => {
    if (!email||!password) { Alert.alert(t('error'), 'Please fill all fields'); return; }
    if (!isLogin&&password!==confirmPassword) { Alert.alert(t('error'), 'Passwords do not match'); return; }
    setLoading(true);
    try {
      if (isLogin) {
        const snap = await getDoc(doc(db,'userEmails',email.replace(/[.@]/g,'_')));
        if (!snap.exists()) { Alert.alert(t('error'), 'No account found with this email'); setLoading(false); return; }
        const { uid } = snap.data();
        const userSnap = await getDoc(doc(db,'users',uid));
        if (!userSnap.exists()) throw new Error('User data not found');
        const userData = userSnap.data();
        if (userData.password!==password) { Alert.alert(t('error'), 'Incorrect password'); setLoading(false); return; }
        await loginUser(uid, userData);
      } else {
        if (!name) { Alert.alert(t('error'), 'Please enter your name'); setLoading(false); return; }
        const uid = generateUID();
        const profileData = { uid, name, email, password, phone:'', state:'', city:'', pincode:'', ecoCoins:0, totalScans:0, totalEcoCoinsEarned:0, co2Saved:0, level:1, createdAt:new Date().toISOString(), language:'en' };
        await setDoc(doc(db,'users',uid), profileData);
        await setDoc(doc(db,'userEmails',email.replace(/[.@]/g,'_')), { uid, email });
        await loginUser(uid, profileData);
      }
    } catch (error) { Alert.alert(t('error'), error.message); }
    setLoading(false);
  };

  return (
    <View style={s.container}>
      <StatusBar barStyle="light-content" backgroundColor={C.bg}/>
      <KeyboardAvoidingView behavior={Platform.OS==='ios'?'padding':'height'} style={{flex:1}}>
        <ScrollView contentContainerStyle={s.scroll} showsVerticalScrollIndicator={false}>
          <TouchableOpacity style={s.langBtn} onPress={()=>setShowLangPicker(!showLangPicker)}>
            <Text style={s.langBtnText}>🌐 {LANGUAGES.find(l=>l.code===language)?.nativeName}</Text>
          </TouchableOpacity>
          {showLangPicker&&(
            <View style={s.langPicker}>
              {LANGUAGES.map(lang=>(
                <TouchableOpacity key={lang.code} style={[s.langOption,language===lang.code&&s.langOptionActive]} onPress={()=>{setLanguage(lang.code);setShowLangPicker(false);}}>
                  <Text style={[s.langOptionText,language===lang.code&&{color:C.yellow}]}>{lang.nativeName} — {lang.name}</Text>
                </TouchableOpacity>
              ))}
            </View>
          )}
          <View style={s.logoArea}>
            <Text style={s.logoText}>SMART</Text>
            <View style={s.logoBin}><Text style={s.logoBinText}>BIN</Text></View>
            <Text style={s.logoSub}>by Team Leavron</Text>
          </View>
          <View style={s.form}>
            <Text style={s.formTitle}>{isLogin?t('signIn'):t('createAccount')}</Text>
            {!isLogin&&<TextInput style={s.input} placeholder={t('name')} placeholderTextColor={C.lightGray} value={name} onChangeText={setName}/>}
            <TextInput style={s.input} placeholder={t('email_placeholder')} placeholderTextColor={C.lightGray} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none"/>
            <TextInput style={s.input} placeholder={t('password')} placeholderTextColor={C.lightGray} value={password} onChangeText={setPassword} secureTextEntry/>
            {!isLogin&&<TextInput style={s.input} placeholder={t('confirmPassword')} placeholderTextColor={C.lightGray} value={confirmPassword} onChangeText={setConfirmPassword} secureTextEntry/>}
            <TouchableOpacity style={s.submitBtn} onPress={handleAuth} disabled={loading}>
              <LinearGradient colors={[C.yellow,C.orange]} start={{x:0,y:0}} end={{x:1,y:0}} style={s.submitGradient}>
                {loading?<ActivityIndicator color={C.bg}/>:<Text style={s.submitText}>{isLogin?t('signIn'):t('signUp')}</Text>}
              </LinearGradient>
            </TouchableOpacity>
            <TouchableOpacity onPress={()=>setIsLogin(!isLogin)}>
              <Text style={s.switchText}>{isLogin?t('noAccount'):t('alreadyHaveAccount')} <Text style={{color:C.yellow}}>{isLogin?t('signUp'):t('signIn')}</Text></Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
}

const s = StyleSheet.create({
  container:{flex:1,backgroundColor:C.bg},
  scroll:{flexGrow:1,padding:24,paddingTop:60},
  langBtn:{alignSelf:'flex-end',backgroundColor:C.gray,paddingHorizontal:14,paddingVertical:8,borderRadius:20,marginBottom:8},
  langBtnText:{color:C.white,fontSize:13},
  langPicker:{backgroundColor:C.gray,borderRadius:12,marginBottom:16,overflow:'hidden'},
  langOption:{padding:14,borderBottomWidth:0.5,borderBottomColor:'#555'}, langOptionActive:{backgroundColor:'#2A2A28'}, langOptionText:{color:C.white,fontSize:14},
  logoArea:{alignItems:'center',marginVertical:40},
  logoText:{fontSize:52,fontWeight:'900',color:C.white,letterSpacing:8},
  logoBin:{backgroundColor:C.yellow,paddingHorizontal:24,paddingVertical:4,marginTop:-8},
  logoBinText:{fontSize:36,fontWeight:'900',color:C.bg,letterSpacing:12},
  logoSub:{color:C.lightGray,fontSize:12,marginTop:8,letterSpacing:3},
  form:{backgroundColor:C.gray,borderRadius:20,padding:24},
  formTitle:{color:C.white,fontSize:22,fontWeight:'700',marginBottom:20},
  input:{backgroundColor:'#2A2A28',borderRadius:12,padding:16,color:C.white,fontSize:15,marginBottom:14,borderWidth:1,borderColor:'#444'},
  submitBtn:{borderRadius:12,overflow:'hidden',marginTop:8,marginBottom:16},
  submitGradient:{padding:16,alignItems:'center'}, submitText:{color:C.bg,fontSize:16,fontWeight:'700'},
  switchText:{color:C.lightGray,textAlign:'center',fontSize:14},
});
