import React from 'react';
import SavedRecipes from '../components/SavedRecipes/SavedRecipes';

const Profile = () => {
  return (
    <div style={{ padding: '2rem', textAlign: 'center' }}>
      <h1>👤 Your Profile</h1>
      <p>Here are your saved FoodLens recipes:</p>
      <SavedRecipes />
    </div>
  );
};

export default Profile;
