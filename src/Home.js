import React from 'react';
// Firebase App (the core Firebase SDK) is always required and must be listed first
import * as firebase from "firebase/app";
// If you enabled Analytics in your project, add the Firebase SDK for Analytics
import "firebase/analytics";
// Add the Firebase products that you want to use
import "firebase/auth";
import "firebase/firestore";
import "firebase/storage";
import RecipeCard from './RecipeCard'

const Home = (props) => {
  
    return (
        <div className="home-view">
            { props.recipeCollection.map((recipe, i) => {
                return <RecipeCard recipe={ recipe } />
            }) }
        </div>
    )
}

export default Home;