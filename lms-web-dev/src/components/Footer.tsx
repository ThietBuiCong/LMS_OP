import type { FunctionComponent } from "react";

const Footer: FunctionComponent = () => {
  return (
    <footer
      style={{
        background: "#0f172a",
        color: "#e5e7eb",
        padding: "30px 20px 20px",
        marginTop: "auto",
        fontFamily: "Inter, sans-serif",
        bottom: 0,
        height: "100%"
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          height: "100%",
          display: "flex",
          flexWrap: "wrap", // Tự động xuống dòng khi màn hình hẹp
          justifyContent: "space-between",
          gap: "30px",
        }}
      >
        {/* Logo + Brand - Chiếm 100% trên mobile để căn giữa, hoặc tự co lại trên PC */}
        <div style={{ flex: "1 1 300px" }}>
          <h2 style={{ color: "#fff", marginBottom: "10px", fontSize: "22px" }}>
            BrainlyX
          </h2>
          <p style={{ margin: 0, lineHeight: "1.6" }}>
            Sản phẩm của CT Tech <br />
            Author: Thiet Bui | Ho Chi Minh City University
          </p>
        </div>

        {/* Contact - Tự động nhảy xuống dưới Logo khi xem bằng điện thoại */}
        <div style={{ flex: "1 1 200px" }}>
          <h4 style={{ color: "#fff", marginBottom: "10px" }}>Liên hệ</h4>
          <ul style={{ listStyle: "none", padding: 0, fontSize: "14px", lineHeight: "1.8" }}>
            <li>Email: support@brainlyx.com</li>
            <li>Hotline: 0123 456 789</li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          borderTop: "1px solid #1f2937",
          marginTop: "20px",
          paddingTop: "15px",
          textAlign: "center",
          fontSize: "12px",
          color: "#9ca3af",
        }}
      >
        © 2026 BrainlyX. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;