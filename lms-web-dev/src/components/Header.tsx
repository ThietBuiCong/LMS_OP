import type { FunctionComponent } from "react";
import "./header.css";
import logo from "../assets/Logo_Primary_NoC.png";

const Header: FunctionComponent = () => {
  return (
    <header style={{backgroundColor:"white"}}>
      <div style={{display: "flex", alignItems: "center",}}><img style={{marginRight: "10px"}} alt="Logo" src={logo}></img><p>BrainlyX</p></div>
      <ul>
        <li><a href="/">Trang chủ</a></li>
        <li><a href="/about">Giới thiệu</a></li>
        <li><a href="/contact">Liên hệ</a></li>
      </ul>
    </header>
  );
};

export default Header;