import React from "react"
import{Text , View , TouchableOpacity, StyleSheet, TextInput, Image,KeyboardAvoidingView,ToastAndroid,Alert} from "react-native"
import {BarCodeScanner} from 'expo-barcode-scanner'
import * as Permissions from "expo-permissions"
import db from '../config'
import firebase from "firebase"


export default class TransactionScreen extends React.Component{
    constructor(){
        super();
        this.state = {
            hasCameraPermissions: null ,
            scanned: false ,
            scannedData: "",
            buttonState: "normal",
            scanbookid: "",
            scanstudentid:"",
            transactionMessage:"",


        }
    }
     getCameraPermission = async (id)=>{
         const {status}= await Permissions.askAsync(Permissions.CAMERA)
         this.setState({
             hasCameraPermissions:status == "granted", scanned:false, buttonState: id
         })
     }
     handleBarcodeScanner = async({type,data}) =>{
        const {buttonState} = this.state

        

        if(buttonState==="bookid"){
          this.setState({
            scanned: true,
            scanbookid: data,
            buttonState: 'normal'
          });
        }
        else if(buttonState==="studentid"){
          this.setState({
            scanned: true,
            scanstudentid: data,
            buttonState: 'normal'
          });
        }
         }
         initaiteBookIssue = async()=>{
             db.collection("transaction").add({
                 studentid:this.state.scanstudentid,
                 bookid:this.state.scanbookid,
                 date:firebase.firestore.Timestamp.now().toDate(),
                 transactionType:"issue"




             })
             db.collection("books").doc(this.state.scanbookid).update({
                 bookAvailability:false
             })
             db.collection("students").doc(this.state.scanstudentid).update({
                 numberOfBooksIssued:firebase.firestore.FieldValue.increment(1)
             })
             this.setState({
              scanbookid: "",
              scanstudentid: ""
            });
         }
         initaiteBookReturn = async()=>{
          db.collection("transaction").add.then(()=>{}).catch((error)=>{
            console.log(error.message)})({
              studentid:this.state.scanstudentid,
              bookid:this.state.scanbookid,
              date:firebase.firestore.Timestamp.now().toDate(),
              transactionType:"return"
 })
 db.collection("books").doc(this.state.scanbookid).update({
              bookAvailability:true
          })
          db.collection("students").doc(this.state.scanstudentid).update({
              numberOfBooksIssued:firebase.firestore.FieldValue.increment(-1)
          })

          this.setState({
            scanbookid: "",
            scanstudentid: ""
          });

         
      }
      checkBookEligibility = async()=> {
        const bookRef = await db.collection("books").where("bookid","==",this.state.scanbookid).get()
        var transactionType = ""
        if(bookRef.docs.length == 0){
          transactionType = false
        }
        else{
          bookRef.docs.map(doc=>{
            var book = doc.data()
            if(book.bookAvailability){
              transactionType = "issue"
            }
            else{
              transactionType = "return"
            }
          })
        }
        return transactionType
      }
      studentEligibleForBookIssue = async()=>{
        const studentRef = await db.collection("students").where("studentid","==",this.state.scanstudentid).get()
        var isStudentEligible = ""
        if(studentRef.docs.length == 0){
          this.setState({
            scanbookid:"",
            scanstudentid:"",

          })
          isStudentEligible = false 
          Alert.alert("the student id doesnt exist in the database")
      }
      else{
        studentRef.docs.map(doc=>{
          var student = doc.data()
          if (student.numberOfBooksIssued < 2){
            isStudentEligible = true
          }
          else{
            isStudentEligible = false
            Alert.alert("student has already issued 2 books")
            this.setState({
              scanbookid:"",
              scanstudentid:"",
            })

          }
        } )
        
      } 
      return isStudentEligible
    } 
    checkStudentEligibilityForBookreturn = async()=>{
      const transactionRef = await db.collection("transaction").where("bookid",'==',this.state.scanbookid).limit(1).get()
      var isStudentEligible = ""
      transactionRef.docs.map(doc => {
        var lastBookTransaction = doc.data()
        if(lastBookTransaction.studentid == this.state.scanstudentid){
          isStudentEligible = true
        }
        else{
          isStudentEligible = false
          Alert.alert("book wasn't issued by this student")
          this.setState({
            scanbookid:"",
            scanstudentid:"",
          })
        }
      
      })
      return isStudentEligible
    }
         handleTransaction = async()=>{
            var transactionType = await this.checkBookEligibility()
            if(!transactionType){
              Alert.alert("the book doesn't exist in the library database")
              this.setState({
                scanbookid:"",
                scanstudentid:""
              })
            } else if(transactionType == "issue"){
              var isStudentEligible = await this.studentEligibleForBookIssue()
              if(isStudentEligible){
                this.initaiteBookIssue()
                Alert.alert("Book issued to the student")
              }
            }else{
                var isStudentEligible = await this.checkStudentEligibilityForBookreturn()
                if(isStudentEligible){
                  this.initaiteBookReturn()
                  Alert.alert("Book returned to the library")
                }
            }
         }
     
    render(){
        const hasCameraPermissions = this.state.hasCameraPermissions;
        const scanned = this.state.scanned;
        const buttonState = this.state.buttonState;
        if (buttonState !== "normal" && hasCameraPermissions){
            return(
                <BarCodeScanner onBarCodeScanned = {scanned ? undefined : this.handleBarcodeScanner}
                style = {StyleSheet.absoluteFillObject}/>
            ) 
        }
        else if (buttonState === "normal"){

       

        return (
          <KeyboardAvoidingView style = {styles.container}behavior="padding"enabled>
                <View>
                    <Image source = {require ("../assets/booklogo.jpg")}
                    style = {{width:200,height:200}}/>
                    <Text style = {{textAlign:"center",fontSize:30}}>
                        WiLib
                    </Text>

                </View>
                <View style = {styles.inputView}>
                    <TextInput style = {styles.inputBox}
                    placeholder = "bookid"
                    onChangeText = {text=>this.setState({scanbookid:text})}
                    value = {this.state.scanbookid}
                    />
                    <TouchableOpacity style = {styles.scanButton}
                    onPress = {()=>{this.getCameraPermission("bookid")}}
                    >
                        <Text style = {styles.buttonText}>
scan
                        </Text>

                    </TouchableOpacity>
                </View>

                <View style = {styles.inputView}>
                    <TextInput style = {styles.inputBox}
                    placeholder = "studentid"

                    onChangeText = {text=>this.setState({scanstudentid:text})}
                    value = {this.state.scanstudentid}
                    />
                    <TouchableOpacity style = {styles.scanButton}
                     onPress = {()=>{this.getCameraPermission("studentid")}}
                    >
                        <Text style = {styles.buttonText}>
scan
                        </Text>

                    </TouchableOpacity>
                   
                </View>
                <Text>{this.state.transactionMessage}</Text>
                <TouchableOpacity style = {styles.submitButton}
                onPress = {async()=>{
                  var transactionMessage=this.handleTransaction()
             
              }}>
                       
                        <Text>Submit </Text>
                    </TouchableOpacity>
                
              
               </KeyboardAvoidingView>
        )
    }
 }
}
const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A', 
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitButton:{
        backgroundColor: "red",
        width:50,
        height:50,

    }

  });

