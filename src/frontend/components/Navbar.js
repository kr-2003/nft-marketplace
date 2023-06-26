import { Link } from "react-router-dom";
import { Navbar, Nav, Button, Container } from "react-bootstrap";
import market from "./market.png";

const Navigation = ({ web3Handler, account }) => {
  return (
    <nav class="bg-[#0a0c0e] no-underline border-b-[0.1px]">
      <div class="mx-auto px-4 flex items-center justify-between">
        <Link
          to="http://www.dappuniversity.com/bootcamp"
          class="flex items-center text-white no-underline"
        >
          <img src={market} width="40" height="40" alt="" class="mr-2" />
          <span class="font-bold">DApp NFT Marketplace</span>
        </Link>
        <button
          class="text-white focus:outline-none lg:hidden"
          aria-controls="responsive-navbar-nav"
          aria-expanded="false"
        >
          <span class="sr-only">Toggle navigation</span>
          <svg
            class="w-6 h-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M4 6h16M4 12h16M4 18h16"
            ></path>
          </svg>
        </button>
        <div class="hidden justify-between items-center w-full lg:flex lg:w-auto lg:order-1" id="mobile-menu-2">
          <ul class="no-underline flex flex-col mt-4 font-medium lg:flex-row lg:space-x-8 lg:mt-0">
            <li>
              <Link to="/" class="no-underline text-white block py-1 pr-4 pl-3 text-white rounded bg-primary-700 lg:bg-transparent lg:text-primary-700 lg:p-0 dark:text-white">
                Home
              </Link>
            </li>
            <li>
              <Link to="/create" class="no-underline text-white block py-1 pr-4 pl-3 text-white rounded bg-primary-700 lg:bg-transparent lg:text-primary-700 lg:p-0 dark:text-white">
                Create
              </Link>
            </li>
            <li>
              <Link to="/my-listed-items" class="no-underline text-white block py-1 pr-4 pl-3 text-white rounded bg-primary-700 lg:bg-transparent lg:text-primary-700 lg:p-0 dark:text-white">
                My Listed Items
              </Link>
            </li>
            <li>
              <Link to="/my-purchases" class="no-underline text-white block py-1 pr-4 pl-3 text-white rounded bg-primary-700 lg:bg-transparent lg:text-primary-700 lg:p-0 dark:text-white">
                My Purchases
              </Link>
            </li>
          </ul>
          <div class="ml-4">
            {account ? (
              <Link
                to={`https://etherscan.io/address/${account}`}
                target="_blank"
                rel="noopener noreferrer"
                class="button nav-button btn-sm mx-4"
              >
                <button class="ti duration-200 si transition-all cubic-bezier(0.4, 0, 0.2, 1) ii text-white yh font-semibold rh text-base lg:text-xl wg py-1 ng px-4 xf bg-gray-900 sf border border-gray-700 ef border-solid xe rounded-md vd justify-center ud items-center ac">
                  {account.slice(0, 5) + "..." + account.slice(38, 42)}
                </button>
              </Link>
            ) : (
                
              <button
                onClick={web3Handler}
                class="ti duration-200 si transition-all cubic-bezier(0.4, 0, 0.2, 1) ii text-white yh font-semibold rh text-base lg:text-xl wg py-1 ng px-4 xf bg-gray-900 sf border border-gray-700 ef border-solid xe rounded-md vd justify-center ud items-center ac"
              >
                Connect Wallet
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;
