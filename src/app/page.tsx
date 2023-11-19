"use client";

import React, { useState, useEffect } from 'react';
import Image from 'next/image'
import { useField, useFormik } from 'formik';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useSignMessage } from 'wagmi';
import { ethers } from 'ethers';

import LogoSVG from '@/components/svg/logo';
import { LensClient, production } from '@lens-protocol/client';
import { useAuth0 } from "@auth0/auth0-react";
import { EAS } from "@ethereum-attestation-service/eas-sdk";
import auth0 from 'auth0-js';
import axios from 'axios';

import Confetti from '@/components/confetti';

// UI Components (Generic)

function Card({ children }: any) { 
  return (          
    <div className="w-full bg-stone-50 rounded-[34px] my-8 shadow border border-gray-100 p-8">
      {children}
    </div>
  );
}

function Label({ children, className }: any) { 
  return (          
    <div className={`pt-4 text-lg font-medium leading-tight text-indigo-950 ${className}`}>
      {children}
    </div>
  );
}

function Button({ children, onClickHandler, variant = 'primary', ...props }: any) { 
  let btnClasses = 'inline-flex items-center justify-center p-0.5 mb-2 me-2 overflow-hidden text-[18px] tracking-wider font-semibold rounded-[66px] group bg-gradient-to-br focus:ring-4 focus:outline-none ';
  let btnClassesSpan;
  
  switch(variant) {
    case 'primary': {
      btnClasses += `text-gray-900 
        bg-gradient-to-r from-teal-300 to-lime-300
        dark:text-white dark:hover:text-gray-900 
        from-teal-300 to-lime-300 
        group-hover:from-teal-300 group-hover:to-lime-300 hover:text-green-900
        focus:ring-lime-200 dark:focus:ring-lime-800`;
       btnClassesSpan = "px-12 py-3.5 transition-all ease duration-25 bg-white bg-opacity-0 dark:bg-gray-900 rounded-[66px] group-hover:bg-opacity-40";
       break;
      }
    case 'blue': {
      btnClasses += `text-white
      bg-gradient-to-br from-purple-600 to-blue-500 
      hover:bg-gradient-to-bl 
      focus:ring-4 focus:outline-none focus:ring-blue-300 
      dark:focus:ring-blue-800 
      font-medium text-center me-2 mb-2`
      btnClassesSpan = "px-12 py-3.5 transition-all ease duration-25 bg-white bg-opacity-0 dark:bg-gray-900 rounded-[66px] group-hover:bg-opacity-40";
      break;
    }
    case 'red': {
      btnClasses += `text-white
      bg-gradient-to-br from-pink-500 to-orange-400
      hover:bg-gradient-to-bl 
      focus:ring-4 focus:outline-none focus:ring-pink-200 
      dark:focus:ring-pink-800 
      font-medium text-center me-2 mb-2`;
      btnClassesSpan = "px-12 py-3.5 transition-all ease duration-25 bg-white bg-opacity-0 dark:bg-gray-900 rounded-[66px] group-hover:bg-opacity-40";
      break;
    }
      // secondary
      default: {
      btnClasses += `text-gray-900 from-teal-300 to-lime-300
        dark:text-gray-900 dark:hover:text-white
        from-teal-300 to-lime-300 
        group-hover:to-bg-inherit group-hover:bg-inherit hover:text-inherit
        focus:ring-lime-200 dark:focus:ring-lime-800`;
       btnClassesSpan = "px-12 py-3.5 transition-all ease duration-25 bg-white dark:bg-gray-900 rounded-[66px] group-hover:bg-opacity-0";
       break;
    }
  }

  return (    
    <button className={btnClasses} onClick={onClickHandler} {...props} >
      <span className={btnClassesSpan}>
        {children}
      </span>
    </button>
  )
}

// Components (with Context)
function WalletConnectButton() {
  return <w3m-button />
}

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [veryfying, setVerifying] = useState(false);
  const [attestationData, setAttestationData] = useState(null);
  const [error, setError] = useState(null);
  const [easState, setEasState] = useState(0); // 0 as initial state, 1 as attested, 2 as not attested 
  const [lensState, setLensState] = useState(0); // 0 as initial state, 1 as attested, 2 as not attested
  const [worldState, setWorldState] = useState(0); // 0 as initial state, 1 as attested, 2 as not attested
  // const [lensText, setLensText] = useState("");
  const { loginWithRedirect } = useAuth0();
  const { signMessageAsync } = useSignMessage();

  const [isConfettiVisible, setIsConfettiVisible] = useState(false);

  let { address, /* isConnecting: isConnectingWalletConnect, isDisconnected */ } = useAccount();

  async function verifyLens() {
    const client = new LensClient({
      environment: production,
    });
    const managedProfiles = await client.wallet.profilesManaged({ for: address! });
    
    console.log("address: ", address)
    console.log("profiles: ", managedProfiles)

    if (managedProfiles.items.length === 0) {
      alert(`You don't manage any profiles, create one first`);
      setLensState(2);
    } else {
      const { id, text } = await client.authentication.generateChallenge({
        signedBy: address!,
        for: managedProfiles.items[0].id,
      });
    
      console.log(`Challenge: `, text);
      const signature = await signMessageAsync({ message: text });
      await client.authentication.authenticate({ id, signature });

      const isAuthenticated = await client.authentication.isAuthenticated();
      console.log(`Lens Authenticated: `, isAuthenticated);
      if (!isAuthenticated) {
        setLensState(2);
      } else {
        setLensState(1);
      }
    }
  }

  async function verifyEAS() {
    const graphqlQuery = `
        {
          attestations(where: { 
              recipient: { equals: "${address}" } 
          }
          take: 1
          ) {
            id
          }
        }
      `;
    
    const requestBody = JSON.stringify({
      query: graphqlQuery
    });

    console.log(address);

    await fetch('https://sepolia.easscan.org/graphql', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: requestBody,
    })
    .then(response => {
      if (!response.ok) {
        throw new Error('Network response was not ok: ' + response.statusText);
      }
      return response.json();
    })
    .then(data => {
      console.log("Response data: ", data);
      alert("numbers of attestation records: " + data.data.attestations.length);
      if (data.data.attestations.length === 0) {
        setEasState(2);
      } else {
        setEasState(1);
        setAuthenticated(true);
      }
      setAttestationData(data.data.attestations)
    })
  }

  async function verifyWorldID() {
    var webAuth = new auth0.WebAuth({
      domain:       'dev-0iu7uwkq2z18z0b6.us.auth0.com',
      clientID:     'IAZew7jaHbxtW0zQaCzBzMSd77lwzJqg'
    });
    webAuth.popup.authorize({
      responseType: 'token',
      redirectUri: 'https://wtform.vercel.app/api/auth/callback/worldcoin',
      domain: 'dev-0iu7uwkq2z18z0b6.us.auth0.com',
    }, function (err: any, authResult: any) {
      //do something
      // TODO set worldState to true if success.
      console.log(authResult);
      console.log(err);
    });
    // webAuth.popup.callback();
  }

  /** Start Formik */

  const FormEntryType = {
    TextArea: 'textarea',
    Select: 'select',
  }

  type FormikValues = {
    rateOverall?: number;
    rateSupport?: number;
    rateRecommend?: number;
    selectGoal?: string;
    selectSource?: string;
    textFeedback: string;
  };

  const formik = useFormik<FormikValues>({
    initialValues: {
      rateOverall: undefined,
      rateSupport: undefined,
      rateRecommend: undefined,
      selectGoal: undefined,
      selectSource: undefined,
      textFeedback: '',
    },
    onSubmit: values => {
      // alert(JSON.stringify(values, null, 2));
      if ((lensState === 1 && easState === 1) 
      || (lensState === 1 && worldState === 1) 
      || easState === 1 && worldState === 1) {
        
        var data = JSON.stringify({
          "data": [
            {
              "question": "How would you rate this event overall?",
              "answer": values.rateOverall
            },
            {
              "question": "How would you rate the technical support you received during the event?",
              "answer": values.rateSupport
            },
            {
              "question": "Would you recommend the hackathon to a friend or colleague?",
              "answer": values.rateRecommend
            },
            {
              "question": "How did you hear about this hackathon?",
              "answer": values.selectSource
            },
            {
              "question": "What were you hoping to achieve at the hackathon?",
              "answer": values.selectGoal
            },
            {
              "question": "Do you have any other feedback or suggestions on how we can make future events better?",
              "answer": values.textFeedback
            },
          ]
        });

        var config = {
          method: 'post',
          url: 'https://api.wtf.academy/hackathon/feedback',
          headers: { 
            'Content-Type': 'application/json'
          },
          data : data
        };

        axios(config)
        .then(function (response) {
          console.log(JSON.stringify(response.data));
          alert("Your Response has been submitted!");

          setIsConfettiVisible(true);
          setTimeout(() => { 
            setIsConfettiVisible(false);
          }, 5000);
        })
        .catch(function (error) {
          console.log(error);
        });
      } else {
        alert("You are not authenticated! At least two of the three methods should be authenticated.");
      }
    },
    validate: values => {
      const errors: any = {};
  
      for (const key in values) {
        if (!values[key as keyof FormikValues] || values[key as keyof FormikValues] === '') {
          errors[key as keyof FormikValues] = 'Required';
        }
      }
  
      return errors;
    },
  });

  function FormEntry(_props: { name: string, prompt: string, description?: string, placeholder?: string, variant?: string, options?: any[]}) {
    // todo: uncomment to unlock buck
    // const [field, meta, helpers] = useField(_props);
    const { description, name, options, placeholder, prompt,  variant, ...props } = _props;
    const inputSharedClasses = `bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${formik.touched[name as keyof FormikValues] && formik.errors[name as keyof FormikValues] ? 'border-red-500' : ''}`;
    let inputJSX;

    switch(variant) {
      case 'textarea': {
        inputJSX = (
          <textarea 
            id={name} 
            name={name}
            rows={4} 
            value={formik.values[name as keyof FormikValues]} // Add type assertion
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}
            className={`block p-2.5 w-full ${inputSharedClasses}`}
            placeholder={placeholder || 'Please mention here'} />
        )
        break;
      }
      default: {
        inputJSX = (
          <select id={name} 
            name={name}
            value={formik.values[name as keyof FormikValues]}
            className={inputSharedClasses}
            onChange={formik.handleChange}
            onBlur={formik.handleBlur}>
            <option value={undefined} selected disabled hidden>{placeholder || 'Select an answer'}</option>
            {options ? options.map((option: any, index: number) => {
              return <option value={option.value} key={`form-entry-select-${name}-${index}`}>{option.label}</option>
            }) : (
              <>
                <option value={10}>10</option>
                <option value={9}>9</option>
                <option value={8}>8</option>
                <option value={7}>7</option>
                <option value={6}>6</option>
                <option value={5}>5</option>
                <option value={4}>4</option>
                <option value={3}>3</option>
                <option value={2}>2</option>
                <option value={1}>1</option>
              </>
            )
            }
          </select>
        )
      }
    }

    return (
      <div className="mb-8" {...props}>
        <div className="mb-8">
          <Label htmlFor={name} className="block text-gray-900 dark:text-white">
            {prompt}
          </Label>
          {description ? (
            <div className="text-base pt-2 leading-tight text-zinc-500">
              {description}
            </div>
          ) : null}
        </div>
        {inputJSX}
      </div>
    );
  }

  /** End Formik */

  return (
    <main className="flex px-10 py-12 min-h-screen flex-col items-center justify-between p-24 text-indigo-950 font-['DM Sans']">
      {isConfettiVisible && <Confetti />}

      <div className="w-full text-stone-900 font-['Figma Hand'] font-bold leading-[96px]"> 
        <LogoSVG />
      </div>
      <div className="w-full mt-20 mb-10 py-12 px-8 bg-stone-50 rounded-[18px] shadow text-center text-2xl font-bold">
        ETHGlobal Istanbul Hackathon Feedback Form
      </div>

      <div className="max-w-[620px] mb-8 text-center text-indigo-950">
        <h2 className="text-indigo-950 pt-8 pb-4 text-[34px] font-bold font-['DM Sans'] leading-[46px]">
          Your Feedback Matters
        </h2>
        <h3 className="text-slate-500 text-lg font-medium leading-[30px]">
          Hacker, thanks for participating at our event. Please help us improve future events by answering this quick survey.
        </h3>
      </div>

      <Card>
        <div className="text-2xl font-bold leading-[35px] text-indigo-950">
          Decentralized Identities
        </div>
        <div className="font-['DM Sans'] text-md font-medium leading-[30px] text-slate-500">
          Please provide your decentralized identities.
        </div>
  
        {/* <div className="border border-zinc-200"></div> */}
        <div className="h-[2px] my-8 w-full rounded-[34px] border border-gray-100 bg-stone-50 shadow"></div>

        <div>
          <Label className="pb-5">WalletConnect</Label>
          <WalletConnectButton />
        </div>

        <div>
          <Label className="pb-5">Lens</Label>
          {
            lensState === 0 ?
            <Button onClickHandler={verifyLens}>Connect</Button> : lensState === 1 
              ? <Button variant="blue">Succeed</Button>
              : <Button variant='red'>Failed</Button>
          }
        </div>

        <div>
          <Label>World ID</Label>
          <Button onClickHandler={verifyWorldID}>Connect</Button>
        </div>

        <div>
          <Label className="pb-5">EAS</Label>
          {
            easState === 0 ?
            <Button onClickHandler={verifyEAS}>Attest</Button> : easState === 1 
              ? <Button variant="blue">Succeed</Button>
              : <Button variant='red'>Failed</Button>
          }
        </div>
    </Card>


    <Card>
      <div className="text-2xl font-bold leading-[35px] text-indigo-950">
        Your Feedback
      </div>
      
      <form onSubmit={formik.handleSubmit}>
        <FormEntry
          variant="select"
          prompt="How would you rate this event overall?"
          description="On a scale of 1-10 with 10 being Great"
          name="rateOverall"
          />
        <FormEntry
          variant="select"
          prompt="How would you rate the technical support you received during the event?"
          description="On a scale of 1-10 with 10 being Great"
          name="rateSupport"
          />
        <FormEntry
          variant="select"
          prompt="Would you recommend the hackathon to a friend or colleague?"
          description="On a scale of 1-10 with 10 being Great"
          name="rateRecommend"
          />
        <FormEntry
          variant="select"
          prompt="How did you hear about this hackathon?"
          name="selectSource"
          options={[
            { value: 'socialMedia', label: 'Social Media (Facebook, Twitter, LinkedIn, etc.)' },
            { value: 'email', label: 'Email Newsletter' },
            { value: 'online', label: 'Website / Online Advertisement' },
            { value: 'friend', label: 'Word of Mouth / Friends / Family' },
            { value: 'school', label: 'University / School' },
            { value: 'event', label: 'Meetup / Event' },
            { value: 'previousAttendee', label: 'Previous Attendee' },
            { value: 'other', label: 'Other' },
          ]}
          />
        <FormEntry
          variant="select"
          prompt="What were you hoping to achieve at the hackathon?"
          name="selectGoal"
          options={[
            { value: 'learn', label: 'Learn new skills or technologies.' },
            { value: 'network', label: 'Network with other professionals or students in the field.' },
            { value: 'develop', label: 'Develop a prototype or start a new project.' },
            { value: 'jobOpportunities', label: 'Seek potential employment or internship opportunities.' },
            { value: 'contribute', label: 'Contribute to the community or a cause.' },
            { value: 'succeed', label: 'Win prizes or gain recognition.' },
            { value: 'fun', label: 'Have fun and enjoy the experience.' },
            { value: 'other', label: 'Other' },
          ]}
          />
        {/* <FormEntry
          variant="textarea"
          prompt="Do you have any other feedback or suggestions on how we can make future events better?"
          name="textFeedback"
          /> */}

        <div className="mb-8">
          <div className="mb-8">
          <Label htmlFor="textFeedback" className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
              Do you have any other feedback or suggestions on how we can make future events better?
            </Label>
          </div>
          <textarea 
              id="textFeedback" 
              name="textFeedback"
              rows={4} 
              value={formik.values.textFeedback}
              onChange={formik.handleChange}
              onBlur={formik.handleBlur}
              className={`block p-2.5 w-full text-sm text-gray-900 bg-gray-50 rounded-lg border border-gray-300 
                focus:ring-blue-500 focus:border-blue-500 
                dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500
                ${formik.errors.textFeedback ? 'border-red-500' : ''}`}
              placeholder="Please mention here" />
        </div>
  
        <Button >
          Submit{' '}
          <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
            →
          </span>
        </Button>
      </form>
    </Card>

    <div className="bg-stone-50 rounded-[34px] shadow border border-gray-100">
    </div>
      

      {/* EVERYTHING BELOW THIS IS FROM CREATE-REACT-APP */}
    </main>
  )
}
