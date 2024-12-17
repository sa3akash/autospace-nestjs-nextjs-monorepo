'use client';
import { IconArrowBack } from '@tabler/icons-react';
import Link from 'next/link';
import { ReactNode } from 'react';
import { BrandIcon } from '../atoms/BrandIcon';
import { GoogleButton } from './GoogleButton';
import { CarScene } from '@autospace/3d/src/scenes/CarScene';
import { RotatingCamera } from '@autospace/3d/src/components/camera/Rotating';

export interface IAuthLayoutProps {
  children: ReactNode;
  title: string;
  showSocial?: boolean;
}

export const AuthLayout = ({
  title,
  children,
  showSocial = true,
}: IAuthLayoutProps) => {
  return (
    <div className=" h-[calc(100vh-4rem)]  ">
      <div
        className="absolute top-16 bottom-0 left-0 right-0"
        onContextMenu={(e) => e.preventDefault()}
      >
        <CarScene
          orbitControls={false}
          camera={<RotatingCamera />}
          hideAllComments
        />
      </div>
      <div className=" flex flex-col justify-center items-center absolute top-0 bg-black/20 backdrop-blur-sm bottom-0  ">
        <div className="p-4 text-white ">
          <div className="w-full max-w-lg mx-auto ">
            <h1 className="flex items-center gap-2 mb-2 text-2xl">
              <BrandIcon /> <div>{title}</div>
            </h1>
            {children}
            {showSocial && (
              <div className="mt-4 text-sm text-gray-300">
                <div className="flex flex-col items-center mb-4">
                  <div className="mb-1 text-xs">Or, continue with</div>
                  <GoogleButton />
                </div>
                <Link href="/" className="flex items-center gap-2">
                  <IconArrowBack className="w-4 h-4" /> Back to home
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
