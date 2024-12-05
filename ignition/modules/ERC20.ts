import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";
import { parseEther } from "viem";

export default buildModule("ERC20", (m) => {
  const token = m.contract("TestToken",[m.getParameter("name","testToken"), m.getParameter("symbol","TT"), m.getParameter("initialSupply",parseEther("10000000"))]);

  return { token };
});
