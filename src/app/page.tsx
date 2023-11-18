"use client";

import React, { useState } from 'react';
import Image from 'next/image'
import LogoSVG from '@/components/svg/logo';
import { LensClient, development } from '@lens-protocol/client';
import { useAuth0 } from "@auth0/auth0-react";

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

function Button({ children, variant = 'primary' }: any) { 
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
    <button className={btnClasses}>
      <span className={btnClassesSpan}>
        {children}
      </span>
    </button>
  )
}

export default function Home() {
  const [authenticated, setAuthenticated] = useState(false);
  const [veryfying, setVerifying] = useState(false);
  const [attestationData, setAttestationData] = useState(null);
  const [error, setError] = useState(null);
  const { loginWithRedirect } = useAuth0();

  async function verifyLens() {
    setVerifying(true);
    const client = new LensClient({
      environment: development,
      headers: {
        origin: 'https://lens-scripts.example',
        'user-agent':
          'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/119.0.0.0 Safari/537.36',
      },
    });
    const managedProfiles = await client.wallet.profilesManaged({ for: address });
  
    if (managedProfiles.items.length === 0) {
      throw new Error(`You don't manage any profiles, create one first`);
    }
  
    const { id, text } = await client.authentication.generateChallenge({
      signedBy: address,
      for: managedProfiles.items[0].id,
    });
  
    console.log(`Challenge: `, text);
  
    const signature = await wallet.signMessage(text);
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

  return (
    <main className="flex px-10 py-12 min-h-screen flex-col items-center justify-between p-24 text-indigo-950 font-['DM Sans']">

      <div className="w-full text-stone-900 font-['Figma Hand'] font-bold leading-[96px]"> 
        <LogoSVG />
      </div>
      <div className="w-full mt-20 mb-10 h-24 bg-stone-50 rounded-[18px] shadow text-center text-2xl font-bold leading-[96px]">
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
          <Label>Wallet</Label>

          <Button>Connect</Button>
          <Button variant="secondary">Sign</Button>
        </div>

        <div>
          <Label>Lens</Label>
          <Button>Connect</Button>
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


    <Card className="rounded-[34px] border border-gray-100 bg-stone-50 shadow">
      <div className="text-2xl font-bold leading-[35px] text-indigo-950">
        Your Feedback
      </div>

      <div>
        <div className="inline-flex flex-col items-start justify-start">
          <div className="text-lg font-medium leading-tight text-indigo-950">
            How would you rate this event overall?
          </div>
          
          <div className="text-base font-medium leading-tight text-slate-500">
            On a scale of 1-10 with 10 being Great
          </div>
          
          <div className="relative">
            <div className="rounded-[46px] border border-gray-100 bg-white shadow">
            </div>
            
            <div className="text-lg font-normal leading-tight text-slate-500">
              Select..
            </div>
          </div>
          
          <div className="text-lg font-medium leading-tight text-indigo-950">
            How would you rate this event overall?
          </div>
          
          <div className="text-base font-medium leading-tight text-slate-500">
            On a scale of 1-10 with 10 being Great
          </div>
          
          <div className="relative">
            <div className="rounded-[46px] border border-gray-100 bg-white shadow">
            </div>
          
            <div className="text-lg font-normal leading-tight text-slate-500">
              Select..
            </div>
          </div>
          
          <div className="text-lg font-medium leading-tight text-indigo-950">
            How would you rate the technical support you received during the event?
          </div>
          
          // other form fields
          
        </div>
        
      </div>

      <div>
      
        <div className="text-lg font-medium leading-tight text-indigo-950">
          Do you have any other feedback or suggestions on how we can make future events better?
        </div>
        
        <div>
        
          <div className="rounded-[21px] border border-gray-100 bg-white shadow">
          </div>
        
          <div className="text-lg font-normal leading-tight text-slate-500">
            Please mention here  
          </div>
          
        </div>
      
      </div>

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
