import { auth, signOut, signIn } from '@autospace/network/src/config/auth';

export default async function Home() {
  const session = await auth();
  console.log(session);

  return (
    <div>
      {session?.user ? (
        <button
          onClick={async () => {
            'use server';
            await signOut();
          }}
        >
          signOut
        </button>
      ) : (
        <button
          onClick={async () => {
            'use server';
            await signIn('google');
          }}
        >
          login with google
        </button>
      )}
    </div>
  );
}
