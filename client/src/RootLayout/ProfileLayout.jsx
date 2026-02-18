import React from 'react';
import { Outlet } from 'react-router';
import ProfileNavbar from '../components/ProfileNavbar/ProfileNavbar';

const ProfileLayout = () => {
    return (
        <div>
            <ProfileNavbar />
        </div>
    );
};

export default ProfileLayout;