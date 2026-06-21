import React, { useContext, useState } from 'react'
import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { useNavigate } from 'react-router-dom'
import { z } from 'zod'
import assets from '../assets/assets'
import { AuthContext } from '../context/authContext'

const profileSchema = z.object({
  fullName: z.string().trim().min(1, 'Name is required'),
  bio: z.string().optional(),
})

const ProfilePage = () => {
  const { authUser, updateProfile } = useContext(AuthContext)
  const [selectedImage, setSelectedImage] = useState(null)
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      fullName: authUser?.fullName || '',
      bio: authUser?.bio || '',
    },
  })

  const onSubmit = async(data) => {
    if (!selectedImage) {
      await updateProfile({
        fullName: data.fullName,
        bio: data.bio,
      })
      navigate('/')
      return
    }

    const reader = new FileReader()
    reader.readAsDataURL(selectedImage)
    reader.onload = async() => {
      const base64Image = reader.result
      await updateProfile({
        profilePic: base64Image,
        fullName: data.fullName,
        bio: data.bio,
      })
      navigate('/')
    }
  }

  return (
    <div className='min-h-screen bg-cover bg-no-repeat flex items-center justify-center'>
      <div className='w-5/6 max-w-2xl backdrop-blur-2xl text-gray-300 border-2 border-gray-600 flex items-center justify-between max-sm:flex-col-reverse rounded-lg'>
        <form onSubmit={handleSubmit(onSubmit)} className='flex flex-col gap-5 p-10 flex-1'>
          <h3 className='text-lg '>Profile Details</h3>
          <label htmlFor="avatar" className='flex items-center gap-3 cursor-pointer'>
            <input onChange={(e) => setSelectedImage(e.target.files[0])} type="file" id="avatar" accept="image/*" hidden className={`w-12 h-12 ${selectedImage && 'rounded-full'}`} />
            <img src={selectedImage ? URL.createObjectURL(selectedImage) : assets.avatar_icon} alt="Avatar" />
            upload a profile picture
          </label>
          <div>
            <input
              {...register('fullName')}
              type="text"
              placeholder='your name'
              className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500'
            />
            {errors.fullName && <p className='mt-1 text-xs text-red-500'>{errors.fullName.message}</p>}
          </div>
          <div>
            <textarea
              {...register('bio')}
              placeholder='Write Profile Bio'
              className='p-2 border border-gray-500 rounded-md focus:outline-none focus:ring-2 focus:ring-violet-500'
              rows={4}
            ></textarea>
            {errors.bio && <p className='mt-1 text-xs text-red-500'>{errors.bio.message}</p>}
          </div>
          <button type="submit" className='bg-gradient-to-r from-purple-400 to-violet-600 text-white p-2 rounded-full cursor-pointer text-lg'>
            Save Changes
          </button>
        </form>
        <img src={authUser?.profilePic || assets.logo_icon} alt="icon" className={`max-w-44 aspect-square rounded-full mx-10 max-sm:mt-10 ${selectedImage && 'rounded-full'}`} />
      </div>
    </div>
  )
}

export default ProfilePage