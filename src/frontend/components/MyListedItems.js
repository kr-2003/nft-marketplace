import { useState, useEffect } from "react";
import { ethers } from "ethers";
import { Row, Col, Card } from "react-bootstrap";

function renderSoldItems(items) {
  return (
    <>
      <h2 className="text-white">Sold</h2>
      <div className="grid grid-cols-4 rounded-lg gap-4">
        <div className="g-4 py-3 rounded-lg">
          {items.map((item, idx) => (
            <div key={idx} className="overflow-hidden rounded-lg h-100">
              <div className="bg-[#485bb1] h-100">
                <img
                  className="h-[60%] object-cover"
                  variant="top"
                  src={item.image}
                />
                <div className="grid h-[40%] bg-[#131418] text-white p-2">
                  <div className="text-xl font-bold text-left">{item.name}</div>
                  <div className="text-left">#{item.itemId._hex}</div>
                  <div className="grid grid-cols-2">
                    <div className="text-left">
                      <span className="text-sm text-[#64748b]">Price:</span>
                      <div>{ethers.utils.formatEther(item.totalPrice)} ETH</div>
                    </div>
                    <div className="text-right">
                      <span className="text-sm text-[#64748b]">Received:</span>
                      <div>{ethers.utils.formatEther(item.price)} ETH</div>
                    </div>
                  </div>
                  {/* <button className="text-white bg-blue-600 rounded-full items-center py-1 px-4 font-bold leading-normal transition duration-200 transform hover:scale-105 shadow">
                    Know More
                  </button> */}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}

export default function MyListedItems({ marketplace, nft, account }) {
  const [loading, setLoading] = useState(true);
  const [listedItems, setListedItems] = useState([]);
  const [soldItems, setSoldItems] = useState([]);
  const loadListedItems = async () => {
    // Load all sold items that the user listed
    const itemCount = await marketplace.itemCount();
    let listedItems = [];
    let soldItems = [];
    for (let indx = 1; indx <= itemCount; indx++) {
      const i = await marketplace.items(indx);
      if (i.seller.toLowerCase() === account) {
        // get uri url from nft contract
        const uri = await nft.tokenURI(i.tokenId);
        console.log(uri);
        // use uri to fetch the nft metadata stored on ipfs
        const response = await fetch(uri);
        const metadata = await response.json();
        // get total price of item (item price + fee)
        const totalPrice = await marketplace.getTotalPrice(i.itemId);
        // define listed item object
        let item = {
          totalPrice,
          price: i.price,
          itemId: i.itemId,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
        };
        listedItems.push(item);
        // Add listed item to sold items array if sold
        if (i.sold) soldItems.push(item);
      }
    }
    setLoading(false);
    setListedItems(listedItems);
    setSoldItems(soldItems);
  };
  useEffect(() => {
    loadListedItems();
  }, []);
  if (loading)
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Loading...</h2>
      </main>
    );
  return (
    <div className="flex justify-center">
      {listedItems.length > 0 ? (
        <div className="px-5 py-3 container">
          <h2 className="text-white">Listed</h2>
          <div className="g-4 py-3 grid grid-cols-4 gap-4">
            {listedItems.map((item, idx) => (
              <div key={idx} className="overflow-hidden rounded-lg h-100">
                <div className="bg-[#485bb1] h-100">
                  <img
                    className="h-[60%] object-cover"
                    variant="top"
                    src={item.image}
                  />
                  <div className="grid h-[40%] bg-[#131418] text-white p-2">
                    <div className="text-xl font-bold text-left">
                      {item.name}
                    </div>
                    <div className="text-left">#{item.itemId._hex}</div>
                    <div className="grid grid-cols-2">
                      <div className="text-left">
                        <span className="text-sm text-[#64748b]">Price:</span>
                        <div>
                          {ethers.utils.formatEther(item.totalPrice)} ETH
                        </div>
                      </div>
                      <div className="text-right">
                        {/* <span className="text-sm text-[#64748b]">Received:</span>
                      <div>{ethers.utils.formatEther(item.price)} ETH</div> */}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {soldItems.length > 0 && renderSoldItems(soldItems)}
        </div>
      ) : (
        <main style={{ padding: "1rem 0" }}>
          <h2>No listed assets</h2>
        </main>
      )}
    </div>
  );
}
