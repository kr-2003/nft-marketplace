import { useState, useEffect, useContext } from "react";
import { ethers } from "ethers";
import { useNavigate } from "react-router-dom";
import { MyContext } from "./MyContext";

const Home = ({ marketplace, nft }) => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const { item, setItem } = useContext(MyContext);
  const loadMarketplaceItems = async () => {
    // Load all unsold items
    const itemCount = await marketplace.itemCount();
    let items = [];
    for (let i = 1; i <= itemCount; i++) {
      const item = await marketplace.items(i);
      if (!item.sold) {
        // get uri url from nft contract
        const uri = await nft.tokenURI(item.tokenId);
        // use uri to fetch the nft metadata stored on ipfs
        const response = await fetch(uri);
        const metadata = await response.json();
        // get total price of item (item price + fee)
        const totalPrice = await marketplace.getTotalPrice(item.itemId);
        // Add item to items array
        items.push({
          totalPrice,
          itemId: item.itemId,
          seller: item.seller,
          name: metadata.name,
          description: metadata.description,
          image: metadata.image,
          address: item.nft,
          sold: item.sold,
        });
      }
    }
    setLoading(false);
    setItems(items);
  };

  const buyMarketItem = async (item) => {
    await (
      await marketplace.purchaseItem(item.itemId, { value: item.totalPrice })
    ).wait();
    loadMarketplaceItems();
  };

  const detailsHandler = (item) => {
    setItem(item);
    navigate("/details");
  };

  useEffect(() => {
    loadMarketplaceItems();
  }, []);
  if (loading)
    return (
      <main style={{ padding: "1rem 0" }}>
        <h2>Loading...</h2>
      </main>
    );
  return (
    <div className="flex justify-center h-[100vh]">
      {items.length > 0 ? (
        <div className="px-5 py-3 container">
          {/* <h2 className="text-white">Listed</h2> */}
          <div className="g-4 py-3 grid grid-cols-4 gap-4">
            {items.map((item, idx) => (
              <div key={idx} className="overflow-hidden rounded-lg h-100">
                <div
                  className="bg-[#485bb1] h-100 cursor-pointer"
                  onClick={() => detailsHandler(item)}
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
                        <button
                          onClick={() => buyMarketItem(item)}
                          className="mt-3 text-white bg-blue-600 rounded-full items-center py-1 px-4 font-bold leading-normal transition duration-200 transform hover:scale-105 shadow"
                        >
                          Buy
                        </button>
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
      ) : (
        <main style={{ padding: "1rem 0" }}>
          <h2>No listed assets</h2>
        </main>
      )}
    </div>
  );
};
export default Home;
