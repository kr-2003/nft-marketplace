import { useState, useEffect } from "react";
import { ethers } from "ethers";

const Home = ({ marketplace, nft }) => {
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
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
        <div className="px-5 py-3 container h-[100%]">
          <div className="grid grid-cols-4 rounded-lg gap-4 h-[60%]">

              {items.map((item, idx) => (
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
                          <button className="mt-3 text-white bg-blue-600 rounded-full items-center py-1 px-4 font-bold leading-normal transition duration-200 transform hover:scale-105 shadow">
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
