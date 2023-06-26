import React, { useContext, useEffect, useState } from "react";
import { MyContext } from "./MyContext";
import { ethers } from "ethers";
import Eth from "./ethereum.svg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useNavigate } from "react-router-dom";
import { act } from "react-dom/test-utils";

const getTimeAndDate = (solidTime) => {
  const date = new Date(solidTime * 1000);
  const year = date.getFullYear(); // Get the 4-digit year
  const month = ("0" + (date.getMonth() + 1)).slice(-2); // Get the 2-digit month (January is 0)
  const day = ("0" + date.getDate()).slice(-2); // Get the 2-digit day of the month
  const hours = ("0" + date.getHours()).slice(-2); // Get the 2-digit hours (0-23)
  const minutes = ("0" + date.getMinutes()).slice(-2); // Get the 2-digit minutes
  const seconds = ("0" + date.getSeconds()).slice(-2);
  const formattedDateTime = `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  return formattedDateTime;
};

function Details({ marketplace, nft }) {
  const navigate = useNavigate();
  const { item } = useContext(MyContext);
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [activity, setActivity] = useState([]);
  const loadEvent = async () => {
    let eventFilter = marketplace.filters.Offered();
    let events = await marketplace.queryFilter(eventFilter);
    const solidTime = parseInt(events[0].args.time._hex, 16);
    events.map((ev) => {
      console.log(ev.args.itemId._hex, item.itemId._hex);
      if (ev.args.itemId._hex === item.itemId._hex) {
        console.log(true);
        const data = {
          event: "Offered",
          itemId: ev.args.itemId._hex,
          seller: ev.args.seller,
          time: parseInt(ev.args.time._hex, 16),
        };
        if (!activity.includes(data)) {
          setActivity((old) => [...old, data]);
          activity.sort((a, b) => {
            return -b.time * 1000 + a.time * 1000;
          });
        }
      }
    });
    // console.log(getTimeAndDate(solidTime));
  };
  const loadEvent2 = async () => {
    let eventFilter = marketplace.filters.Bought();
    let events = await marketplace.queryFilter(eventFilter);
    const solidTime = parseInt(events[0].args.time._hex, 16);
    events.map((ev) => {
      console.log(ev.args.itemId._hex, item.itemId._hex);
      if (ev.args.itemId._hex === item.itemId._hex) {
        console.log(true);
        const data = {
          event: "Bought",
          itemId: ev.args.itemId._hex,
          seller: ev.args.seller,
          buyer: ev.args.buyer,
          time: parseInt(ev.args.time._hex, 16),
        };
        if (!activity.includes(data)) {
          setActivity((old) => [...old, data]);
          activity.sort((a, b) => {
            return -b.time * 1000 + a.time * 1000;
          });
        }
      }
    });
    // console.log(getTimeAndDate(solidTime));
  };
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
    loadEvent();
    loadEvent2();
    console.log(activity);
    activity.sort((a, b) => {
      return -b.time * 1000 + a.time * 1000;
    });
    if (item.itemId == undefined) navigate("/");
  }, []);
  return (
    <>
      {item.itemId && (
        <div className="flex justify-center h-[100vh]">
          <div className="grid grid-cols-2 p-6">
            <div className="rounded-2xl">
              <img
                className="rounded-2xl h-[100%] object-cover"
                variant="top"
                src={item.image}
              />
            </div>
            <div className="text-white p-2">
              <div className="font-bold text-4xl">{item.name}</div>
              <div>{item.address}</div>
              <div className="bg-[#141519] rounded-lg p-2 mt-4">
                <div className="text-white ">
                  <div className="grid grid-cols-2 w-40 gap-2">
                    <img
                      className="h-10 w-10"
                      src={require("./ethereum.png")}
                    ></img>
                    <div className="h-100 flex items-center justify-center font-bold text-white text-4xl">
                      {ethers.utils.formatEther(item.totalPrice)}
                      <span className="text-sm ml-2">ETH</span>
                    </div>
                  </div>
                  {!item.sold && (
                    <button
                      onClick={() => buyMarketItem(item)}
                      className="w-[100%] py-2 text-xl mt-3 text-white bg-blue-600 rounded-full items-center py-1 px-4 font-bold leading-normal transition duration-200 transform hover:scale-105 shadow"
                    >
                      Buy Now
                    </button>
                  )}
                  {item.sold && (
                    <button className="w-[100%] py-2 text-xl mt-3 text-white bg-blue-600 rounded-full items-center py-1 px-4 font-bold leading-normal transition duration-200 transform shadow">
                      Sold
                    </button>
                  )}
                </div>
              </div>
              <div className="bg-[#141519] rounded-lg p-2 mt-4 text-left">
                <h4>Description</h4>
                <div>{item.description}</div>
              </div>
              <div className="bg-[#141519] rounded-lg p-2 mt-4 text-left">
                <h4 className="text-2xl">Activity</h4>
                {activity.map((ev) => (
                  <>
                    <div className="grid grid-cols-10">
                      <span className="col-span-1">
                        {ev.event === "Offered" && (
                          <img
                            className="h-10 w-10"
                            src={require("./offered.png")}
                          ></img>
                        )}
                        {ev.event === "Bought" && (
                          <img
                            className="h-10 w-10"
                            src={require("./sold.png")}
                          ></img>
                        )}
                      </span>
                      {ev.event === "Offered" && (
                        <span className="col-span-9">
                          Offered by {ev.seller}
                        </span>
                      )}
                      {ev.event === "Bought" && (
                        <span className="col-span-9">
                          Bought by {ev.seller}
                        </span>
                      )}
                    </div>
                    <div>{getTimeAndDate(ev.time)}</div>
                  </>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}

export default Details;
