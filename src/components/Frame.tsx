import { FC, useEffect, useState } from "react";
import sdk from '@farcaster/frame-sdk';

export const Frame: FC = () => {
  const [isSDKLoaded, setIsSDKLoaded] = useState(false);

  useEffect(() => {
    const load = async () => {
      sdk.actions.ready();
    };
    if (sdk && !isSDKLoaded) {
      setIsSDKLoaded(true);
      load();
    }
  }, [isSDKLoaded]);

  return null;
}

export default Frame;