import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import DeployMarketplace from "./DeployMarketplace";
import setVestingManagerSettings from "./SetVestingManagerSettings";

export default buildModule("SetMarketplace",(m)=>{

    const marketplace = m.useModule(DeployMarketplace);
    const manager = m.useModule(setVestingManagerSettings)

    return{marketplace: marketplace.marketplace,manager:manager.manager,vesting: manager.vesting,token: marketplace.token ,marketplaceSetting:marketplace.marketPlaceSetting};
})
