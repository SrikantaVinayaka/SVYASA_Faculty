import React from "react";
import svyasaLogo from "../../assets/svyasaLogo.png";

const PDFHeader = ({
  degree,
  assessmentNumber,
  university = "S-VYASA DEEMED TO BE UNIVERSITY",
  city = "Bengaluru",
  address = "School of Advanced Studies, Sattva Global City, Mysore Road, RV Vidyaniketan, Rajarajeshwari Nagar",
}) => {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        marginBottom: "12px",
      }}
    >
      <img
        src={svyasaLogo}
        alt="S-VYASA Logo"
        style={{
          width: "114px",
          height: "114px",
          objectFit: "cover",
          flexShrink: 0,
        }}
      />

      <div
        style={{
          flex: 1,
          textAlign: "center",
          paddingRight: "75px",
        }}
      >
        <p
          style={{
            fontSize: "20px",
            fontWeight: "bold",
            margin: 0,
            letterSpacing: "0.3px",
          }}
        >
          {university}
        </p>

        <p
          style={{
            fontSize: "15px",
            fontWeight: "600",
            margin: "3px 0 0",
          }}
        >
          {city}
        </p>

        <p
          style={{
            fontSize: "12px",
            color: "#444",
            margin: "3px 0 0",
            lineHeight: "1.4",
          }}
        >
          {address}
        </p>

        {degree && (
          <p
            style={{
              fontSize: "13px",
              fontWeight: "600",
              margin: "4px 0 0",
            }}
          >
            {degree}
          </p>
        )}

        {assessmentNumber && (
          <p
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              margin: "3px 0 0",
            }}
          >
            IA-{assessmentNumber}
          </p>
        )}
      </div>
    </div>
  );
};

export default PDFHeader;