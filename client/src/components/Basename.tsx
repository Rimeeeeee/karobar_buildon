import React, { useEffect, useState } from "react";
import {
  getAvatar,
  getName,
  Name,
  Avatar,
  Identity,
  Address,
} from "@coinbase/onchainkit/identity";
import { baseSepolia } from "viem/chains";
import { useActiveAccount } from "thirdweb/react";


interface AbcProps {
  uid?: string; 
}

const basename = "karobar.basetest.eth";

const Abc: React.FC<AbcProps> = ({ uid }) => {
  const address = uid || useActiveAccount()?.address; 
  const [avatar, setAvatar] = useState<string | null>(null);
  const [name, setName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true; 
    const fetchData = async () => {
      if (!address) {
        setLoading(false);
        return;
      }

      try {
        const fetchedAvatar = await getAvatar({
          ensName: basename,
          chain: baseSepolia,
        });
        const fetchedName = await getName({ address, chain: baseSepolia });

        if (isMounted) {
          setAvatar(fetchedAvatar);
          setName(fetchedName);
        }
      } catch (err: any) {
        if (isMounted) {
          setError(err.message || "Failed to fetch user data");
        }
      } finally {
        if (isMounted) {
          setLoading(false);
        }
      }
    };

    fetchData();

    return () => {
      isMounted = false; 
    };
  }, [address]);

  if (loading) {
    return <div>Loading...</div>; 
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  return (
    <div className="flex items-center">
      <Identity
        address={`0x${address?.slice(2)}`}
        chain={baseSepolia}
        schemaId="0xf8b05c79f090979bf4a80270aba232dff11a10d9ca55c4f88de95317970f0de9"
      >
        
       {/*<Avatar address={`0x${address?.slice(2)}`} chain={baseSepolia} />*/}
       <Name address={`0x${address?.slice(2)}`} chain={baseSepolia} />
        <Address />
      </Identity>
    </div>
  );
};

export default Abc;
