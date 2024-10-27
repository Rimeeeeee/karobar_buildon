import React, { useEffect, useState } from "react";
import { NavLink } from "react-router-dom";
import Campaign from "../components/Campaign";
import { useKBRTokenContext } from "../context/context";
import { readContract } from "thirdweb";
import { download } from "thirdweb/storage";
import Product from "../components/Product";

const Merch = () => {
  const [products, setProducts] = useState<any[]>([]);
  const { Marketplace, client } = useKBRTokenContext();
  const [loading, setLoading] = useState<boolean>(true);

  const handleBuy = (pid: number) => {
    console.log(`Bought ${pid}`);
  };

  useEffect(() => {
    const getAllProducts = async () => {
      try {
        const productData = await readContract({
          contract: Marketplace,
          method:
          "function getProducts() view returns ((uint256 pid, string name, string imageHash, string description, uint256 price, uint256 qty)[])",
          params: [],
        });

        console.log("Product Data:", productData);

        const productsWithImages = await Promise.all(
          productData.map(async (product: any) => {
            if (product.imageHash) {
              const response = await download({
                client,
                uri: product.imageHash, // Using the IPFS URI format
              });
              const fileBlob = await response.blob();
              const fileUrl = URL.createObjectURL(fileBlob);
              return { ...product, imageHash: fileUrl };
            }
            // Return campaign data without modifying the image if imageHash is not present
            return product;
          })
        );

        setProducts(Array.from(productsWithImages));
        setLoading(false); // Set loading to false after successful fetch
      } catch (error: any) {
        console.error("Error fetching Products", error);
        setLoading(false);
      }
    };

    getAllProducts();
  }, [Marketplace, client]);

  if (loading) {
    return <p className="text-white">Loading Products...</p>;
  }

  if (!products.length) {
    return <p className="text-white">No Products currently available.</p>;
  }

  console.log(products);

  return (
    <div className="mt-20">
     <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-2 mt-10 m-1">
        {products.map((product, index) => (
          <Product
            pid={index}
            name={product.name}
            imageHash={product.imageHash} 
            description={product.description}
            price={product.price}
            qty={product.qty}
            onBuy={handleBuy}
          />
        ))}
      </div>
    </div>
  );
};

export default Merch;
