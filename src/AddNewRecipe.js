import React, { useState } from 'react';
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";
// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import "firebase/analytics";
// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";

const AddNewRecipe = () => {

    const [recipeTitle, setRecipeTitle] = useState('');    
    const [recipeDescription, setRecipeDescription] = useState('');
    const [recipePhoto, setRecipePhoto] = useState(null);
    const [step, setStep] = useState(1);


    //I want the display to change to home Display upon Recipe Creation

    function createRecipe (e) {
        e.preventDefault();
        saveRecipeWithImage(recipeTitle, recipeDescription, recipePhoto);
        setRecipeTitle('');
        setRecipeDescription('');
        setRecipePhoto('')
    }

    function changeRecipeTitle (e) {
        setRecipeTitle(e.target.value);
    }

    function changeRecipeDescription (e) {
        setRecipeDescription(e.target.value);
    }

    function getUserName() {
        return firebase.auth().currentUser.displayName;
    }

    function getProfilePicUrl() {
        return firebase.auth().currentUser.photoURL;
    }

    function handlePhotoChange (e) {
        if (e.target.files[0]) {
            const image = e.target.files[0];
            console.log(image);
            setRecipePhoto(image);
        }
    }

    function saveRecipeWithImage (title, description, file) {
        firebase.firestore().collection('recipes').add({
            name: getUserName(),
            title: title,
            description: description,
            imageUrl: 'LOADING_IMAGE_URL',
            profilePicUrl: getProfilePicUrl(),
            timestamp: firebase.firestore.FieldValue.serverTimestamp()
        }).then(function(messageRef) {
            var filePath = firebase.auth().currentUser.uid + '/' + messageRef.id + '/' + file.name;
            return firebase.storage().ref(filePath).put(file).then(function(fileSnapshot) {
                return fileSnapshot.ref.getDownloadURL().then((url) => {
                    return messageRef.update({
                        imageUrl: url,
                        storageUri: fileSnapshot.metadata.fullPath
                    });
                });
            });
        }).catch(function(error) {
            console.error('There was an error uploading a file to Cloud Storage:', error);
        })
    }

    function isUserSignedIn() {
        //this returns true is a user is signed in.... maybe that state takes care of this job?
        return !!firebase.auth().currentUser;
      }

    function nextStep (e) {
        e.preventDefault();
        setStep(step + 1);
    }

    function previousStep (e) {
        e.preventDefault();
        setStep(step - 1);
    }

    function nextStepPossible () {
        if (step >= 1 && step < 4) {
            return true;
        } else {
            return false;
        }
    }

    function previousStepPossible () {
        if (step > 1) {
            return true;
        } else {
            return false;
        }
    }

    function needToSignIn () {
        if ( step === 4 && !isUserSignedIn()) {
            return true
        }  else {
            return false
        }
    }

    return (
        <div className="new-recipe-view">
            { needToSignIn() && <div className="sign-in-arrow"><i class="fa fa-arrow-up fa-4x"></i></div> }
            <form className="recipe-form" >
                <div className="recipe-creation-header"> <h2>Recipe Creation Station</h2></div>
                { (step === 1) && <label htmlFor="title" className="form-title" >
                    <h2>Step 1</h2>
                    Give your recipe a name...
                    <input type="text" name="title" maxLength="18" autoComplete="off" value={ recipeTitle } onChange={ changeRecipeTitle } />
                </label> }

                { (step === 2) &&  <label htmlFor="photo" className="form-photo" >
                    <h2>Step 2</h2>
                    Upload a photo of your dish...
                    <input type="file" name="photo" autoComplete="off" onChange= { handlePhotoChange } />
                </label>}

                { (step === 3) && <label htmlFor="description" className="form-description" >
                    <h2>Step 3</h2>
                    Give a short description of your dish...
                    <textarea name="description" id="description" cols="25" rows="10" autoComplete="off" value={ recipeDescription } onChange={ changeRecipeDescription } ></textarea>
                </label>}

                { step === 4 && (<div className="create-button-container">
                            <h2>Step 4</h2>
                            { isUserSignedIn() ? 'Publish your recipe!' : 'Please sign-in to share your recipe.' }
                            <div> { isUserSignedIn() ?  <button onClick={ createRecipe } className="submit-button" ><div className="submit-button-inner"> <div className="flashers-1"></div><div className="flashers-2"></div> </div><div className="flashers-3"></div></button> : <button className="submit-button-fake" > <div></div></button>  } </div>   
                                </div>) } 


                <div className="form-button-container">
                    { previousStepPossible() ? <div className="previous-step-button"><i className="fa fa-arrow-left fa-4x" onClick={ previousStep }></i></div> : ''}
                    { nextStepPossible() ? <div className="next-step-button" ><i className="fa fa-arrow-right fa-4x" onClick={ nextStep }></i></div> : '' }
                    {/* create button should only be clickable if the user is signed in */}
                    {/* the image that the user uploads should display as they are progressing through the steps */}
                </div>
            </form>

            <div className="draft-recipe-card-container">
                <div className="recipe-card-creation">
                    <div className={`recipe-card-inner-creation ${step === 3 ? 'flip' : '' }`}>
                        
                        <div className="recipe-card-front-creation">
                            <div className="image-container-creation" >
                                <img src={ recipePhoto ? recipePhoto : 'https://source.unsplash.com/random/400x400' } alt=""/>    
                                {/* how to create a life view of the photo on upload? */}
                            </div>
                            <div className="recipe-front-text-creation">
                                <h1> { recipeTitle } </h1>
                            </div>
                        </div>
                        
                        <div className="recipe-card-back-creation">
                            <div className="recipe-back-title-creation" ><h1>{ recipeTitle }</h1></div>
                            <div className="recipe-back-description-creation" ><p> { recipeDescription } </p></div>
                            <div className="recipe-back-author-container-creation">
                                <div className="recipe-back-author-creation" ><p> { isUserSignedIn() ? getUserName() : 'YOUR NAME HERE' } </p></div>
                                <div className="recipe-back-author-pic-creation" > { isUserSignedIn() ? <img src={getProfilePicUrl()} alt=""/> : <i className="fa fa-user fa-5x"></i> } </div>
                            </div>
                        </div>
                    
                    </div>
                </div>
            </div>
        </div>

    )
}

export default AddNewRecipe;