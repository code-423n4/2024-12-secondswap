import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import ERC20 from "./ERC20";
import ProxyModule from "./DeployMarketplaceProxies";
import DeployMarketplaceSetting from "./DeployMarketplaceSetting";

export default buildModule("UpgradeModule", (m) => {
  const s2Admin = m.getAccount(1);

  // const proxy = m.useModule(ProxyModule);
  // const marketplaceSetting = m.useModule(DeployMarketplaceSetting);
  // const token = m.useModule(ERC20);
  const proxyAdmin = m.contractAt("ProxyAdmin","0x15b666C7D08f4b797CfAd7FDA8e1C03139b354bC")
  const proxy = m.contractAt("TransparentUpgradeableProxy","0x497c34Da2776d8236D380084d11f6Bd73045dF2f")
  const marketplaceSetting = "0x0B6B716F036cec59B208eF1dd0674d6f6c79311D";
  const token = "0x9F1364dcC11d52F17674F10B8Fc2dF795333b079";


  // Deploy new implementation with resolved marketplaceSetting address
  const newImplementation = m.contract(
      "SecondSwap_Marketplace"
  );

  // Create initialization data
  const initData = m.encodeFunctionCall(
      newImplementation,
      "initialize",
      // [token.token,marketplaceSetting.marketplaceSetting]
      [token,marketplaceSetting]
  );

    m.call(
        proxyAdmin,
        "upgradeAndCall",
        [
            proxy,
            newImplementation,
            initData
        ],
        {
            from: s2Admin,
        }
    );

  return {
      // newImplementation,
      // proxy: proxy.proxy,
      // proxyAdmin: proxy.proxyAdmin,
      // marketplaceSetting: marketplaceSetting.marketplaceSetting,
      // vestingManager: marketplaceSetting.vestingManager,
      // whitelist: marketplaceSetting.whitelistDeployer,
      // token: token.token
  };
});