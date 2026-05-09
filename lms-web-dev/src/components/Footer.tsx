import type { FunctionComponent } from "react";

const Footer: FunctionComponent = () => {
  return (
    <footer
      style={{
        background: "#0f172a",
        color: "#e5e7eb",
        padding: "40px 20px 20px",
        marginTop: "auto",
        fontFamily: "Inter, sans-serif",
      }}
    >
      <div
        style={{
          maxWidth: "1200px",
          margin: "0 auto",
          display: "grid",
          gridTemplateColumns: "1fr 1fr 1fr 1fr",
          gap: "20px",
        }}
      >
        {/* Logo + Brand */}
        <div>
          <h2 style={{ color: "#fff", marginBottom: "10px" }}>
            BrainlyX
          </h2>
          <p>Sản phẩm của CT Tech
            <p>Author: Thiet Bui</p>  |
           From: Ho Chi Minh City University</p>
        </div>

        {/* Product */}
        <div>
          <h4 style={{ color: "#fff", marginBottom: "10px" }}>Sản phẩm</h4>
          <ul style={{ listStyle: "none", padding: 0, fontSize: "14px" }}>
            <li>AI Learning</li>
            <li>Courses</li>
            <li>Flashcards</li>
            <li>Community</li>
          </ul>
        </div>

        {/* Company */}
        <div>
          <h4 style={{ color: "#fff", marginBottom: "10px" }}>Công ty</h4>
          <ul style={{ listStyle: "none", padding: 0, fontSize: "14px" }}>
            <li>Về chúng tôi</li>
            <li>Tuyển dụng</li>
            <li>Blog</li>
          </ul>
        </div>

        {/* Contact */}
        <div>
          <h4 style={{ color: "#fff", marginBottom: "10px" }}>Liên hệ</h4>
          <ul style={{ listStyle: "none", padding: 0, fontSize: "14px" }}>
            <li>Email: support@brainlyx.com</li>
            <li>Hotline: 0123 456 789</li>
          </ul>
        </div>
      </div>

      {/* Divider */}
      <div
        style={{
          borderTop: "1px solid #1f2937",
          marginTop: "30px",
          paddingTop: "15px",
          textAlign: "center",
          fontSize: "13px",
          color: "#9ca3af",
        }}
      >
        © 2026 BrainlyX. All rights reserved.
      </div>
    </footer>
  );
};

export default Footer;