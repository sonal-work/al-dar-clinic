import Image from 'next/image'
import { useEffect, useState } from 'react'
import { Inter } from 'next/font/google'
import { Controller, useForm } from 'react-hook-form'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import PhoneInput, { isValidPhoneNumber } from 'react-phone-number-input'
import { FaCircleXmark, FaCircleCheck } from 'react-icons/fa6'
import Link from 'next/link'
import DatePicker from 'react-datepicker'
import axios from 'axios'
import 'react-phone-number-input/style.css'
import 'react-datepicker/dist/react-datepicker.css'

import Animated from '@/components/Animated'
import Button from '@/components/Button'
import asiaPay from '@/public/icons/asia-pay.svg'
import useAuth from '@/hooks/useAuth'

const inter = Inter({
  weight: ['400', '500', '600'],
  subsets: ['latin'],
  display: 'swap',
})

const toLocalISO = (date) => {
  const dateObj = new Date(date)
  const now = new Date()

  if (now.toLocaleDateString() === dateObj.toLocaleDateString()) {
    // Set current local time on the given date
    dateObj.setHours(
      now.getHours(),
      now.getMinutes(),
      now.getSeconds(),
      now.getMilliseconds()
    )
  }

  // Convert to UTC without shifting time
  return new Date(
    Date.UTC(
      dateObj.getFullYear(),
      dateObj.getMonth(),
      dateObj.getDate(),
      dateObj.getHours(),
      dateObj.getMinutes(),
      dateObj.getSeconds(),
      dateObj.getMilliseconds()
    )
  ).toISOString()
}

const Book = () => {
  const { isAuthenticated } = useAuth()
  const [loading, setLoading] = useState({
    book: false,
    serviceType: false,
    location: false,
    slot: false,
    therapist: false,
  })
  const [slots, setSlots] = useState(null)
  const [serviceTypes, setServiceTypes] = useState([])
  const [locations, setLocations] = useState([])
  const [therapists, setTherapists] = useState([])
  const [message, setMessage] = useState()
  const [therapist, setTherapist] = useState()
  const [date, setDate] = useState()

  const {
    register,
    handleSubmit,
    control,
    watch,
    formState: { errors },
    reset,
  } = useForm()

  const fetchTherapists = async (locationId) => {
    console.log(locationId)

    setLoading((prev) => {
      return { ...prev, therapist: true }
    })
    try {
      const res = await axios.post('/team-member/location', {
        locationId: locationId.target.value,
      })

      setTherapists(res.data.data)
    } catch (error) {
      console.log(error)

      toast.error(
        error?.response?.data?.message ||
          'Something went wrong while fetching therapists. Please, try again!'
      )
    } finally {
      setLoading((prev) => {
        return { ...prev, therapist: false }
      })
    }
  }

  const fetchServiceTypes = async () => {
    setLoading((prev) => {
      return { ...prev, serviceType: true }
    })
    try {
      const res = await axios.get('/service-type/all', {
        headers: {
          Authorization:
            localStorage.getItem('userToken') ||
            sessionStorage.getItem('userToken'),
        },
      })

      setServiceTypes(res.data.data)
    } catch (error) {
      console.log(error)

      toast.error(
        error?.response?.data?.message ||
          'Something went wrong while fetching service types. Please, reload the page!'
      )
    } finally {
      setLoading((prev) => {
        return { ...prev, serviceType: false }
      })
    }
  }
  const fetchLocations = async () => {
    setLoading((prev) => {
      return { ...prev, location: true }
    })
    try {
      const res = await axios.get('/location/all', {
        headers: {
          Authorization:
            localStorage.getItem('userToken') ||
            sessionStorage.getItem('userToken'),
        },
      })

      setLocations(res.data.data)
    } catch (error) {
      toast.error(
        error?.response?.data?.message ||
          'Something went wrong while fetching locations. Please, reload the page!'
      )
    } finally {
      setLoading((prev) => {
        return { ...prev, location: false }
      })
    }
  }

  useEffect(() => {
    if (axios.defaults.baseURL && isAuthenticated) {
      fetchServiceTypes()
      fetchLocations()
      // fetchTherapists()
    }
  }, [axios.defaults, isAuthenticated])

  const onSubmit = async (data) => {
    setLoading((prev) => {
      return { ...prev, book: true }
    })

    try {
      const res = await axios.post(
        '/appointments/create',
        {
          ...data,
          date: toLocalISO(data.date),
          slotId: Number(data.slot),
          age: Number(data.age),
          serviceTypeId: data.serviceTypeId || serviceTypes[0].id,
          locationId: data.locationId || locations[0].id,
        },
        {
          headers: {
            Authorization:
              localStorage.getItem('userToken') ||
              sessionStorage.getItem('userToken'),
          },
        }
      )

      toast.custom(
        (t) => (
          <motion.div
            initial={{ zIndex: -20, opacity: 0 }}
            animate={
              t.visible
                ? { zIndex: 100, opacity: 1 }
                : { zIndex: -20, opacity: 0 }
            }
            transition={{ duration: 0.3 }}
            className='absolute -top-4 -left-4 w-screen !h-screen bg-black/60 flex items-center justify-center p-5'
          >
            <motion.div
              initial={{ y: 15 }}
              animate={t.visible ? { y: 0 } : { y: 15 }}
              className='w-fit xl:w-full max-w-2xl md:mx-auto bg-white rounded-2xl p-3 pb-12 md:p-8 md:pb-20'
            >
              <Button
                size='icon'
                variant='ghost'
                onClick={() => {
                  setSlots(null)
                  reset()
                  toast.dismiss(t.id)
                }}
                className='ml-auto'
              >
                <FaCircleXmark className='text-primary text-4xl' />
              </Button>
              <div>
                <FaCircleCheck className='text-primary text-[100px] md:text-[136px] lg:text-[180px] xl:text-[218px] mx-auto' />
              </div>
              <p className='text-xl font-medium md:text-2xl xl:text-4xl text-center pt-12 pb-0 md:mt-18 tracking-wide'>
                Your Appointment is Confirmed
              </p>
              <p className='md:text-lg xl:text-xl text-center md:pt-6 pb-12 tracking-wide'>
                We accept payment: Iraq / AsiaPay{' '}
                <Image
                  src={asiaPay}
                  height={44}
                  weight={44}
                  alt='Asia Pay Icon'
                  className='inline w-11 h-11'
                />{' '}
                <span className='text-primary'>+964 775 776 6919</span> <br />{' '}
                OMAN / MOBILE PAYMENT{' '}
                <span className='text-primary'>+968 9199 2031</span>
              </p>

              <div className='flex flex-row items-center justify-center gap-4 md:hidden'>
                <Link href={`/profile/appointments/${res.data.data.id}`}>
                  <Button
                    variant='outline'
                    className='text-primary border-primary'
                    size='sm'
                    onClick={() => toast.dismiss(t.id)}
                  >
                    Appointment details
                  </Button>
                </Link>
                <Button
                  size='sm'
                  onClick={() => {
                    setSlots(null)
                    reset()
                    toast.dismiss(t.id)
                  }}
                >
                  Continue
                </Button>
              </div>
              <div className='hidden flex-row items-center justify-center gap-8 md:flex'>
                <Link href={`/profile/appointments/${res.data.data.id}`}>
                  <Button
                    variant='outline'
                    className='text-primary border-primary'
                    onClick={() => toast.dismiss(t.id)}
                  >
                    Appointment details
                  </Button>
                </Link>
                <Button
                  onClick={() => {
                    setSlots(null)
                    reset()
                    toast.dismiss(t.id)
                  }}
                >
                  Continue
                </Button>
              </div>
            </motion.div>
          </motion.div>
        ),
        { duration: Infinity }
      )
    } catch (error) {
      console.log(error)

      toast.error(
        error?.response?.data?.errors?.[0]?.message ||
          error?.response?.data?.message ||
          'Something went wrong with booking. Please, try again!'
      )
    } finally {
      setLoading((prev) => {
        return { ...prev, book: false }
      })
    }
  }

  const fetchSlots = async () => {
    setLoading((prev) => ({ ...prev, slot: true }))
    try {
      const isoString = toLocalISO(date)
      console.log(isoString)

      const res = await axios.post('/slots/date', {
        date: isoString,
        teamMemberId: therapist,
      })

      setSlots(res.data.data)
    } catch (error) {
      console.log(error)
      toast.error(error.message || 'Something went wrong')
    } finally {
      setLoading((prev) => ({ ...prev, slot: false }))
    }
  }

  useEffect(() => {
    if (date && therapist) {
      fetchSlots()
    } else {
      setSlots(null)
    }
  }, [date, therapist])

  return (
    <div
      className={`md:shadow-[0px_4px_21.6px_0px_rgba(0,0,0,0.08)] md:rounded-3xl md:bg-white max-w-[800px] mx-auto mt-4 md:mb-16 md:mt-24 px-5 py-7 ${inter.className}`}
    >
      <Animated animationType='fadeInLeft'>
        <h1 className='text-primary text-2xl font-semibold'>Appointment</h1>
      </Animated>
      <form className='mt-10' onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className='flex flex-col md:flex-row md:flex-wrap md:gap-x-10'>
          <Animated className='mb-4 w-full md:w-[calc(50%-20px)]'>
            <label htmlFor='name' className='text-sm font-semibold text-black'>
              Full name<span className='text-primary'>*</span>
            </label>
            <input
              type='text'
              id='name'
              {...register('fullname', {
                required: 'Name is required',
              })}
              className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: errors.name ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className='text-red-500 text-sm mt-1'
            >
              {errors.name?.message || ' '}
            </motion.p>
          </Animated>
          <Animated className='mb-4 w-full md:w-[calc(50%-20px)]'>
            <label htmlFor='email' className='text-sm font-semibold text-black'>
              Email<span className='text-primary'>*</span>
            </label>
            <input
              type='text'
              id='email'
              {...register('email', {
                required: 'Email is required',
                pattern: {
                  value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                  message: 'Please enter correct email id',
                },
              })}
              className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.email ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: errors.email ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className='text-red-500 text-sm mt-1'
            >
              {errors.email?.message || ' '}
            </motion.p>
          </Animated>
          <Animated className='mb-4 w-full md:w-[calc(50%-20px)]'>
            <label htmlFor='age' className='text-sm font-semibold text-black'>
              Age in years<span className='text-primary'>*</span>
            </label>
            <input
              type='number'
              id='age'
              {...register('age', {
                required: 'Age is required',
                validate: (value) => value > 0 || 'Enter proper age',
              })}
              min={0}
              className={`w-full no-spinner mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.age ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: errors.age ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className='text-red-500 text-sm mt-1'
            >
              {errors.age?.message || ' '}
            </motion.p>
          </Animated>

          <Animated className='mb-4 md:w-[calc(50%-20px)] w-full'>
            <label htmlFor='phone' className='text-sm font-semibold text-black'>
              Phone<span className='text-primary'>*</span>
            </label>
            <Controller
              name='phone'
              control={control}
              defaultValue=''
              rules={{
                required: 'Phone number is required',
                validate: (value) =>
                  isValidPhoneNumber(value) ||
                  'Please enter a valid phone number',
              }}
              render={({ field }) => (
                <PhoneInput
                  {...field}
                  id='phone'
                  defaultCountry='AE'
                  className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.phone ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              )}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: errors.phone ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className='text-red-500 text-sm mt-1'
            >
              {errors.phone?.message}
            </motion.p>
          </Animated>
          <Animated className='mb-4 w-full md:w-[calc(50%-20px)]'>
            <label htmlFor='date' className='text-sm font-semibold text-black'>
              Appointment Date<span className='text-primary'>*</span>
            </label>
            <Controller
              name='date'
              control={control}
              defaultValue={null} // Default value for the date field
              rules={{
                required: 'Date is required',
                validate: (value) => {
                  if (!value) return 'Date is required'
                  return true
                },
              }}
              render={({ field }) => (
                <DatePicker
                  wrapperClassName='w-full'
                  selected={field.value}
                  onChange={(date) => {
                    field.onChange(date)
                    setDate(date)
                  }}
                  minDate={new Date()} // Disable past dates
                  placeholderText='Select a date'
                  className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.date ? 'border-red-500' : 'border-gray-300'
                  }`}
                />
              )}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: errors.date ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className='text-red-500 text-sm mt-1'
            >
              {errors.date?.message || ' '}
            </motion.p>
          </Animated>
          <Animated className='mb-4 w-full md:w-[calc(50%-20px)]'>
            <label
              htmlFor='location'
              className='text-sm font-semibold text-black'
            >
              Clinic Location
              <span className='text-primary'>*</span>
            </label>
            <Controller
              name='locationId'
              control={control}
              rules={{
                required: 'Clinic location is required',
              }}
              render={({ field }) => (
                <select
                  name='location'
                  onChange={(location) => {
                    field.onChange(location)
                    fetchTherapists(location)
                  }}
                  id='location'
                  className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.locationId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {loading.location ? (
                    <option>Loading...</option>
                  ) : locations?.length > 0 ? (
                    <>
                      <option value=''>Select a location</option>
                      {locations.map((el) => (
                        <option key={el.id} value={el.id}>
                          {el.name}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value=''>No locations available</option>
                  )}
                </select>
              )}
            />
          </Animated>
          <Animated className='mb-4 w-full md:w-[calc(50%-20px)]'>
            <label
              htmlFor='therapist'
              className='text-sm font-semibold text-black'
            >
              Therapist
              <span className='text-primary'>*</span>
            </label>
            <Controller
              name='therapistId'
              control={control}
              rules={{
                required: 'Therapist is required',
              }}
              render={({ field }) => (
                <select
                  name='therapistId'
                  onChange={(therapistId) => {
                    field.onChange(therapistId)
                    setTherapist(therapistId.target.value)
                  }}
                  id='therapistId'
                  className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                    errors.therapistId ? 'border-red-500' : 'border-gray-300'
                  }`}
                >
                  {loading.therapist ? (
                    <option>Loading...</option>
                  ) : therapists?.length > 0 ? (
                    <>
                      <option value=''>Select a therapist</option>
                      {therapists.map((el) => (
                        <option key={el.id} value={el.id}>
                          {el.name}
                        </option>
                      ))}
                    </>
                  ) : (
                    <option value=''>No therapists available</option>
                  )}
                </select>
              )}
            />
          </Animated>
          <Animated className='mb-4 w-full'>
            <label htmlFor='slot' className='text-sm font-semibold text-black'>
              Slots<span className='text-primary'>*</span>
            </label>
            {loading.slot ? (
              <div className='flex justify-center items-center py-4'>
                <div className='w-6 h-6 border-4 border-gray-300 border-t-primary rounded-full animate-spin'></div>
              </div>
            ) : slots === null ? (
              <p className='text-gray-500'>
                Choose a date, a clinic location and a therapist.
              </p>
            ) : slots?.length > 0 ? (
              <div className='flex flex-wrap gap-4 mt-1'>
                {slots
                  .sort((a, b) => {
                    const [aTime, aPeriod] = a.startTime.split(' ')
                    let [aHour, aMinute] = aTime.split(':').map(Number)

                    const [bTime, bPeriod] = b.startTime.split(' ')
                    let [bHour, bMinute] = bTime.split(':').map(Number)

                    // Convert to 24-hour format
                    if (aPeriod.toLowerCase() === 'pm' && aHour !== 12) {
                      aHour += 12
                    } else if (aPeriod.toLowerCase() === 'am' && aHour === 12) {
                      aHour = 0
                    }

                    if (bPeriod.toLowerCase() === 'pm' && bHour !== 12) {
                      bHour += 12
                    } else if (bPeriod.toLowerCase() === 'am' && bHour === 12) {
                      bHour = 0
                    }

                    return aHour * 60 + aMinute - (bHour * 60 + bMinute)
                  })
                  .map((slot) => (
                    <label key={slot.id} className='relative cursor-pointer'>
                      <input
                        type='radio'
                        name='slot'
                        value={slot.id}
                        {...register('slot', {
                          required: 'Please select a slot',
                        })}
                        className='hidden'
                      />
                      <div
                        className={`px-4 py-2 border rounded-lg transition-all duration-300 ${
                          watch('slot') == slot.id
                            ? 'border-primary bg-primary/20'
                            : ''
                        } `}
                      >
                        {slot.startTime}
                      </div>
                    </label>
                  ))}
              </div>
            ) : (
              <p className='text-gray-500'>No slots available.</p>
            )}

            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: errors.slot ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className='text-red-500 text-sm mt-1'
            >
              {errors.slot?.message || ' '}
            </motion.p>
          </Animated>
          <Animated className='mb-4 w-full md:w-[calc(50%-20px)]'>
            <label
              htmlFor='address'
              className='text-sm font-semibold text-black'
            >
              Street Address<span className='text-primary'>*</span>
            </label>
            <input
              type='text'
              id='address'
              {...register('address', {
                required: 'Address is required',
              })}
              className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.address ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: errors.address ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className='text-red-500 text-sm mt-1'
            >
              {errors.address?.message || ' '}
            </motion.p>
          </Animated>
          <Animated className='mb-4 w-full md:w-[calc(50%-20px)]'>
            <label
              htmlFor='postal'
              className='text-sm font-semibold text-black'
            >
              Area/City<span className='text-primary'>*</span>
            </label>
            <input
              type='text'
              id='postal'
              {...register('postalCode', {
                required: 'Area/City is required',
              })}
              className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.postal ? 'border-red-500' : 'border-gray-300'
              }`}
            />
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: errors.postal ? 1 : 0 }}
              transition={{ duration: 0.3 }}
              className='text-red-500 text-sm mt-1'
            >
              {errors.postal?.message || ' '}
            </motion.p>
          </Animated>
          {/* <div className='mb-4 hidden md:block w-[calc(50%-20px)]'></div> */}
          <Animated className='mb-4 w-full md:w-[calc(50%-20px)]'>
            <label
              htmlFor='serviceType'
              className='text-sm font-semibold text-black'
            >
              Type of Service<span className='text-primary'>*</span>
            </label>
            <select
              name='serviceType'
              id='serviceType'
              defaultValue={serviceTypes[0]}
              className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary ${
                errors.serviceTypeId ? 'border-red-500' : 'border-gray-300'
              }`}
              {...register('serviceTypeId', {
                required: 'Service type is required',
              })}
            >
              {loading.serviceType ? (
                <option>Loading...</option>
              ) : (
                serviceTypes.map((el) => (
                  <option key={el.id} value={el.id}>
                    {el.name}
                  </option>
                ))
              )}
            </select>
          </Animated>
          <Animated className='mb-4 w-full md:w-[calc(50%-20px)]'>
            <label
              htmlFor='gender'
              className='text-sm font-semibold text-black'
            >
              Gender<span className='text-primary'>*</span>
            </label>
            <select
              name='gender'
              id='gender'
              defaultValue='MALE'
              className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 border-gray-300 focus:ring-primary`}
              {...register('gender')}
            >
              <option value='MALE'>Male</option>
              <option value='FEMALE'>Female</option>
            </select>
          </Animated>

          <Animated className='mb-4 w-full md:w-[calc(50%-20px)]'>
            <label
              htmlFor='medium'
              className='text-sm font-semibold text-black'
            >
              Consultation medium<span className='text-primary'>*</span>
            </label>
            <select
              name='medium'
              id='medium'
              defaultValue='OFFLINE'
              className={`w-full mt-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 border-gray-300 focus:ring-primary`}
              {...register('medium')}
            >
              <option value='OFFLINE'>Offline</option>
              <option value='ONLINE'>Online</option>
            </select>
          </Animated>
          <Animated className='relative w-full mb-4'>
            <textarea
              name='message'
              id='message'
              placeholder='Message (Optional)'
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className='w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 border-gray-300 focus:ring-primary'
              rows={5}
              {...register('message')}
            ></textarea>
          </Animated>
          <Animated className='flex flex-row items-center gap-[25px]'>
            <Button type='submit' className='font-semibold !py-3 !px-14'>
              {loading.book ? 'Submitting...' : 'Submit'}
            </Button>
            <Button
              variant='outline'
              className=' text-red-500 border-red-500 font-semibold !py-3'
              onClick={() => reset()}
            >
              Cancel
            </Button>
          </Animated>
        </div>
      </form>
    </div>
  )
}

export default Book
