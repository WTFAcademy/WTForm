"use client";

import React, { useState } from 'react';
import Image from 'next/image'
import { useFormik } from 'formik';
import { useWeb3Modal } from '@web3modal/wagmi/react';
import { useAccount, useSignMessage } from 'wagmi';

import LogoSVG from '@/components/svg/logo';
import { LensClient, development } from '@lens-protocol/client';
import { useAuth0 } from "@auth0/auth0-react";

// UI Components (Generic)

function Card({ children }: any) { 
  return (          
    <div className="w-full bg-stone-50 rounded-[34px] my-8 shadow border border-gray-100 p-8">
      {children}
    </div>
  );
}

function Label({ children }: any) { 
  return (          
    <div className="pt-4 pb-5 text-lg font-medium leading-tight text-indigo-950">
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
  const { loginWithRedirect } = useAuth0();
  const { signMessageAsync } = useSignMessage();

  let { address, /* isConnecting: isConnectingWalletConnect, isDisconnected */ } = useAccount();

  async function verifyLens() {
    console.log("jhere");
    setVerifying(true);
    const client = new LensClient({
      environment: development,
      headers: {
        origin: 'https://lens-scripts.example',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      },
    });
    const managedProfiles = await client.wallet.profilesManaged({ for: address! });
    
    console.log("address: ", address)
    console.log("profiles: ", managedProfiles)

    if (managedProfiles.items.length === 0) {
      throw new Error(`You don't manage any profiles, create one first`);
    }
  
    const { id, text } = await client.authentication.generateChallenge({
      signedBy: address!,
      for: managedProfiles.items[0].id,
    });
  
    console.log(`Challenge: `, text);
    const signature = await signMessageAsync({ message: text });
    await client.authentication.authenticate({ id, signature });

    const isAuthenticated = await client.authentication.isAuthenticated();
    console.log(`Is LensClient authenticated? `, isAuthenticated);
    if (!isAuthenticated) {
      setAuthenticated(false);
    } else {
      setAuthenticated(true);
    }
    setVerifying(false);
  }

  async function verifyEAS() {
    setVerifying(true);
    const query = {
      query: `
        query Attestation {
          attestations(
            where: { recipient: { eq: "${address}" } }
            first: 1
          ) {
            id
            attester
            recipient
            refUID
            revocable
            revocationTime
            expirationTime
            data
          }
        }
      `
    };

    await fetch('https://easscan.org/graphql', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(query),
    })
    .then(response => response.json())
    .then(data => {
      console.log(data.data.attestations);
      setAttestationData(data.data.attestations)
      setAuthenticated(true);
    })
    .catch(error => {
      setError(error)
    });
    setVerifying(false);
  }

  async function verifyWorldID() {

  }

  /** Start Formik */

  const FormEntryType = {
    TextArea: 'textarea',
    Select: 'select',
  }

  const formik = useFormik({
    initialValues: {
      rateOverall: '',
      rateSupport: '',
      rateRecommend: '',
      selectGoal: '',
      selectSource: '',
      textFeedback: '',
    },
    onSubmit: values => {
      alert(JSON.stringify(values, null, 2));
    },
    validate: values => {
      const errors = {};
  
      for (const key in values) {
        if (!values[key]) {
          errors[key] = 'Required';
        }
      }
  
      return errors;
    },
  });

  function FormEntry({ description, name, options, placeholder, prompt,  variant, ...props }: any) {
    const inputSharedClasses = `bg-gray-50 border border-gray-300 text-gray-900 text-sm rounded-lg focus:ring-blue-500 focus:border-blue-500 block w-full p-2.5 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500 ${formik.errors[name] ? 'border-red-500' : ''}`;
    let inputJSX;

    switch(variant) {
      case 'textarea': {
        inputJSX = (<textarea 
          id={name} 
          name={name}
          rows={4} 
          value={formik.values[name]}
          onChange={formik.handleChange}
          onBlur={formik.handleBlur}
          className={`block p-2.5 w-full ${inputSharedClasses}`}
          placeholder={placeholder || 'Please mention here'} />
        )
        break;
      }
      default: {
        inputJSX = (
          <select id={formik.values[name]} name={formik.values[name]} 
            className={inputSharedClasses}
            onChange={formik.handleChange}>
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
      <div className="mb-6" {...props}>
        <Label htmlFor={name} className="block mb-2 text-sm font-medium text-gray-900 dark:text-white">
          {prompt}
        </Label>
        {description ?? (
          <div className="text-base font-medium leading-tight text-slate-500">
            {description}
          </div>
        )}
        {inputJSX}
      </div>
    );
  }

  /** End Formik */

  return (
    <main className="flex px-10 py-12 min-h-screen flex-col items-center justify-between p-24 text-indigo-950 font-['DM Sans']">

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
          <Label>WalletConnect</Label>
          <WalletConnectButton />
        </div>

        <div>
          <Label>Lens</Label>
          <Button onClickHandler={verifyLens}>Connect</Button>
        </div>

        <div>
          <Label>Polygon ID</Label>
          <Button>Connect</Button>
        </div>

        <div>
          <Label>EAS</Label>
          <Button>Attest</Button>
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
        <FormEntry
          variant="textarea"
          prompt="Do you have any other feedback or suggestions on how we can make future events better?"
          name="textFeedback"
          />
  
        <Button>
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

      <div className="mb-32 grid text-center lg:max-w-5xl lg:w-full lg:mb-0 lg:grid-cols-4 lg:text-left">
        <a
          href="https://nextjs.org/docs?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Docs{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Find in-depth information about Next.js features and API.
          </p>
        </a>

        <a
          href="https://nextjs.org/learn?utm_source=create-next-app&utm_medium=appdir-template-tw&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Learn{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Learn about Next.js in an interactive course with&nbsp;quizzes!
          </p>
        </a>

        <a
          href="https://vercel.com/templates?framework=next.js&utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Templates{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Explore starter templates for Next.js.
          </p>
        </a>

        <a
          href="https://vercel.com/new?utm_source=create-next-app&utm_medium=appdir-template&utm_campaign=create-next-app"
          className="group rounded-lg border border-transparent px-5 py-4 transition-colors hover:border-gray-300 hover:bg-gray-100 hover:dark:border-neutral-700 hover:dark:bg-neutral-800/30"
          target="_blank"
          rel="noopener noreferrer"
        >
          <h2 className={`mb-3 text-2xl font-semibold`}>
            Deploy{' '}
            <span className="inline-block transition-transform group-hover:translate-x-1 motion-reduce:transform-none">
              -&gt;
            </span>
          </h2>
          <p className={`m-0 max-w-[30ch] text-sm opacity-50`}>
            Instantly deploy your Next.js site to a shareable URL with Vercel.
          </p>
        </a>
      </div>
    </main>
  )
}
