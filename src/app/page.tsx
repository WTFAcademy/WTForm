import { useState } from 'react';
import Image from 'next/image'
import LogoSVG from '@/components/svg/logo';
import { LensClient, development } from '@lens-protocol/client';

export default function Home() {
  const [verified, setVerified] = useState(false);
  const [veryfying, setVerifying] = useState(false);
  const [attestationData, setAttestationData] = useState(null);
  const [error, setError] = useState(null);

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
      setVerified(false);
    } else {
      setVerified(true);
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
      setVerified(true);
    })
    .catch(error => {
      setError(error)
    });
    setVerifying(false);
  }

  return (
    <main className="flex px-8 py-8 min-h-screen flex-col items-center justify-between p-24 text-indigo-950 font-['DM Sans']">

      <div className="w-full text-stone-900 font-['Figma Hand'] font-bold leading-[96px]"> 
        <LogoSVG />
      </div>

      <div className="w-full my-8 h-24 bg-white rounded-[18px] shadow text-center text-2xl font-bold leading-[96px]">
        ETHGlobal Istanbul Hackathon Feedback Form
      </div>

      <div className="max-w-[620px] mb-8 text-center text-indigo-950">
        <div className="text-center text-indigo-950 text-[34px] font-bold font-['DM Sans'] leading-[46px]">
          Your Feedback Matters
        </div>

        <div className="text-center text-slate-500 text-lg font-medium leading-[30px]">
          Hacker, thanks for participating at our event. Please help us improve future events by answering this quick survey.
        </div>
      </div>



      <div className="bg-stone-50 rounded-[34px] shadow border border-gray-100 px-4">
        <div className="text-2xl font-bold leading-[35px] text-indigo-950">
          Decentralized Identities
        </div>
        <div className="font-['DM Sans'] left-[77.07px] top-[285px] w-[466.06px] text-lg font-medium leading-[30px] text-slate-500">
          Please provide your decentralized identities.
        </div>
        <div className="h-[2px] w-full rounded-[34px] border border-gray-100 bg-stone-50 shadow"></div>

        <div>
          <div className="text-lg font-medium leading-tight text-indigo-950">
            Wallet
          </div>

          <div className="inline-flex flex-col items-center justify-center rounded-[66px] border-2 border-violet-400 px-10 pb-[21px] pt-[19px]">
            <div className="text-center text-[21px] font-semibold leading-tight text-fuchsia-500">
              Sign
            </div>
          </div>

          <div className="inline-flex items-center justify-center gap-2 rounded-[56px] bg-gradient-to-b from-violet-400 to-fuchsia-500 px-10 pb-[21px] pt-5 shadow">
            <div className="text-center text-2xl font-bold leading-tight text-white">
              Connect
            </div>
          </div>

        </div>
        <div>

          <div className="inline-flex items-center justify-center gap-2 rounded-[56px] bg-gradient-to-b from-violet-400 to-fuchsia-500 px-10 pb-[21px] pt-5 shadow">
            <div className="text-center text-2xl font-bold leading-tight text-white">
              Sign
            </div>
          </div>

          <div className="text-lg font-medium leading-tight text-indigo-950">
            Lens
          </div>

        </div>

        <div>

          <div className="inline-flex items-center justify-center gap-2 rounded-[56px] bg-gradient-to-b from-violet-400 to-fuchsia-500 px-10 pb-[21px] pt-5 shadow">
            <div className="text-center text-2xl font-bold leading-tight text-white">
              Sign
            </div>
          </div>

          <div className="text-lg font-medium leading-tight text-indigo-950">
            PolygonID
          </div>

        </div>

        <div>

          <div className="inline-flex items-center justify-center gap-2 rounded-[56px] bg-gradient-to-b from-violet-400 to-fuchsia-500 px-10 pb-[21px] pt-5 shadow">
            <div className="text-center text-2xl font-bold leading-tight text-white">
              Attest
            </div>
          </div>

          <div className="text-lg font-medium leading-tight text-indigo-950">
            EAS
          </div>

        </div>

        <div className="text-center text-lg font-medium leading-[30px] text-slate-500">
          Hacker, thanks for participating at our event. Please help us improve future events by answering this quick survey.<br />
        </div>

        <div className="border border-zinc-200"></div>
    </div>

    <div>

    <div className="rounded-[34px] border border-gray-100 bg-stone-50 shadow">
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

    </div>

    </div>



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
