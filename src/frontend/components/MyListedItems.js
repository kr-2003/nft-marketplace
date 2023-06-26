import { useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import { Row, Col, Card } from "react-bootstrap";
import { useNavigate } from "react-router-dom";
import { MyContext } from "./MyContext";

export default function MyListedItems({ marketplace, nft, account }) {
  const navigate = useNavigate();
  const { setItem } = useContext(MyContext);
  const [loading, setLoading] = useState(true);
  const [listedItems, setListedItems] = useState([]);
  const [soldItems, setSoldItems] = useState([]);
  function renderSoldItems(items) {
    const detailsHandler = (item) => {
      setItem(item);
      navigate("/details");
    };

    return (
      <>
        <h2 className="text-white">Sold</h2>
        <div className="g-4 py-3 grid grid-cols-4 gap-4">
          {items.map((item, idx) => (
            <div key={idx} className="overflow-hidden rounded-lg h-100 cursor-pointer">
              <div
                onClick={() => detailsHandler(item)}
                className="bg-[#485bb1] h-100"
              >
                <img
                  className="h-[60%] object-cover w-100"
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
                </div>
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

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
          sold: i.sold,
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
  const detailsHandler = (item) => {
    setItem(item);
    navigate("/details");
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
              <div key={idx} className="overflow-hidden rounded-lg h-100 cursor-pointer">
                <div
                  onClick={() => detailsHandler(item)}
                  className="bg-[#485bb1] h-100"
                >
                  <img
                    className="h-[60%] object-cover w-100"
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
