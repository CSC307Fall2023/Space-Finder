"use client"
import { useState, useEffect } from 'react';
import { Box } from '@mui/material';
import { Button } from '@mui/material';
import { TextField } from '@mui/material';
import { Avatar } from '@mui/material';
import { Typography } from '@mui/material';
import StudyCard from '../components/studycard';

export default function Profile() {
	const [isEditing, setIsEditing] = useState(false);
	const [pfp, setPhoto] = useState("/path/to/profile-picture.jpg");

	const [user, setUser] = useState({});

	useEffect(() => {
		fetch('/api/users', { method: 'get' })
			.then((response) => response.ok && response.json())
			.then(data => {
				setUser(data);
				if (data.profilePic !== "" && data.profilePic !== undefined) decodeImage(data.profilePic);
			});
	}, []);

	const toggleEditStatus = () => {
		setIsEditing(!isEditing);
	};
	const handleNameChange = (e) => {
		setUser({
			...user,
			username: e.target.value
		});
		fetch(`/api/users/${user.id}`, {
			method: 'put',
			body: JSON.stringify({ username: e.target.value })
		})
	};

	const handleBioChange = (e) => {
		setUser({
			...user,
			bio: e.target.value
		});
		fetch(`/api/users/${user.id}`, {
			method: 'put',
			body: JSON.stringify({ bio: e.target.value })
		})
	};

	const handleSchoolChange = (e) => {
		setUser({
			...user,
			school: e.target.value
		});
		fetch(`/api/users/${user.id}`, {
			method: 'put',
			body: JSON.stringify({ school: e.target.value })
		})

	};

	const encodeImageToBase64 = (imageUrl) => {
		return new Promise((resolve, reject) => {
			const canvas = document.createElement('canvas');
			const ctx = canvas.getContext('2d');
			const image = new Image();

			image.onload = () => {
				canvas.width = image.width;
				canvas.height = image.height;

				ctx.drawImage(image, 0, 0);

				const base64String = canvas.toDataURL('image/jpeg'); // You can change the format if needed

				resolve(base64String);
			};

			image.onerror = (error) => {
				reject(error);
			};

			image.src = imageUrl;
		});
	};

	const dataURLtoFile = (dataurl, filename) => {
		var arr = dataurl.split(','),
			mime = arr[0].match(/:(.*?);/)[1],
			bstr = atob(arr[arr.length - 1]),
			n = bstr.length,
			u8arr = new Uint8Array(n);
		while (n--) {
			u8arr[n] = bstr.charCodeAt(n);
		}
		return new File([u8arr], filename, { type: mime });
	}

	const handlePFPChange = (e) => {
		const newImage = e.target.files[0];
		const objectUrl = URL.createObjectURL(newImage);
		// Encode the selected image to a base64 string
		encodeImageToBase64(objectUrl)
			.then((encodedString) => {
				setPhoto(objectUrl); // Set the profile picture URL

				fetch(`/api/users/${user.id}`, {
					method: 'put',
					body: JSON.stringify({ profilePic: encodedString })
				})
			})
			.catch((error) => {
				console.error('Error encoding image:', error);
			});
	};

	const decodeImage = (base64String) => {
		// Decode the base64 string back to an image
		const objectUrl = URL.createObjectURL(dataURLtoFile(base64String, "profile-picture.jpg"));
		setPhoto(objectUrl);
	};

	const [recentSpots, setRecentSpots] = useState([
		{
			id: 1,
			name: 'Library',
		},
		{
			id: 2,
			name: 'Study Room',
		},
		{
			id: 3,
			name: 'Coffee Shop',
		}
	]);

	return (
		<>
			<Box sx={{ display: 'flex', alignItems: 'center', flexDirection: 'row', mb: -6 }}>
				<Box sx={{ p: 10, display: 'flex', alignItems: 'center', flexDirection: 'column' }}>
					<Avatar alt="Profile Picture" src={pfp} sx={{ width: 200, height: 200 }} />
					<Button component="label">
						Edit Profile Pic
						<input
							type="file"
							accept="image/*"
							hidden
							onChange={handlePFPChange} />
					</Button>
				</Box>
				{isEditing ? (
					<Box sx={{ p: 10, width: '50vw', display: 'flex', alignItems: 'left', flexDirection: 'column' }}>
						<TextField
							fullWidth
							value={user.username}
							inputProps={{ maxLength: 30 }}
							onChange={handleNameChange}
							label='Name'
							helperText='Max 30 characters'
						/>
						<TextField
							fullWidth
							multiline
							value={user.bio}
							inputProps={{ maxLength: 500 }}
							onChange={handleBioChange}
							label='Bio'
							helperText='Max 500 characters'
						/>
						<TextField
							fullWidth
							multiline
							value={user.school}
							inputProps={{ maxLength: 100 }}
							onChange={handleSchoolChange}
							label='School'
							helperText='Max 100 characters'
						/>
						<Button onClick={toggleEditStatus} >
							Save
						</Button>
					</Box>) : (
					<Box sx={{ p: 10, width: '50vw', display: 'flex', alignItems: 'left', flexDirection: 'column' }}>
						<Typography variant="h3" gutterBottom>
							{user.username}
						</Typography>
						<Typography variant="body1" gutterBottom>
							Bio: {user.bio}
						</Typography>
						<Typography variant="body1" gutterBottom>
							School: {user.school}
						</Typography>
						<Button sx={{ width: '25vw' }} onClick={toggleEditStatus} >
							Edit Name/Bio/School
						</Button>
					</Box>
				)}
			</Box>
			<Box>
				<Typography sx={{ m: 6, fontSize: 24 }}>
					Recent Study Spots
				</Typography>
				<Box sx={{ display: 'flex', flexWrap: 'wrap', }}>
					{recentSpots.map(spot => (
						<StudyCard key={spot.id} studyName={spot.name} liveStatus={"Busy AF"} rating={4.5} />
					))}
				</Box>
			</Box>
		</>
	)
}