import React from 'react';
import { StyleSheet, Text, View, Image, KeyboardAvoidingView, TextInput, TouchableOpacity, Alert } from 'react-native';
import * as firebase from "firebase"




export default class LoginScreen extends React.Component {
    constructor(){
        super();
        this.state ={
            emailid:"",
            password:""

        }
    }
    login = async(emailid,password)=>{
        if(emailid && password){
            try{
                const response = await firebase.auth().signInWithEmailAndPassowrd(emailid,password)
                if(response){
                    this.props.navigation.navigate("Transaction")
                }
            }
            catch(error){
                switch(error.code){
                    case "auth/user-not-found":
                        Alert.alert("user doesn't exist!!")
                        break

                    case "auth/invalid-email":
                        Alert.alert("incorrect email or password!")    
                        break
                }
            }
        }
      
    }
  render(){
    return (
      <KeyboardAvoidingView style ={{aklignItems:"center", marginTop: 20 }}>
          <View>
            <Image source = {require("../assets/booklogo.jpg")} style = {{width: 200 , height:200}}/>
            <Text style = {{textAlign: "center", fontSize:20,fontFamily:"dimbo"}}>Wireless Library</Text>
          </View>
          <View>
              <TextInput style = {styles.loginBox}
              placeholder = "abc@example.com"
              keyboardType = "email-address"
              onChangeText= {(text)=>{
            emailid: text
              }}/>
               <TextInput style = {styles.loginBox}
              placeholder = "Enter Password"
              secureTextEntry = {true}
              onChangeText= {(text)=>{
            password: text
              }}/>
          </View>
          <View>
              <TouchableOpacity style = {{height:30,width:70,marginTop:20,borderRadius:6, backgroundColor:"black"}}
              onPress = {()=>{this.login(this.state.emailid,this.state.password)}}>
                  <Text style = {{textAlign: "center", fontSize:20,fontFamily:"dimbo", color:"white"}}>
                      Login

                  </Text>
              </TouchableOpacity>
          </View>

        
      </KeyboardAvoidingView>
      
    );
  }
}
const styles = StyleSheet.create({
    loginBox:{width:300, height:40,borderWidth:1.5,fontSize:20,margin:10}
})