import { InvoiceData } from "@/services/invoiceCheckService";

const InvoiceTemplate = ({ invoiceData }: { invoiceData: InvoiceData }) => {
  return (
    <div
      style={{
        position: "relative",
        backgroundImage: 'url("./invoice-template/background.png")',
        backgroundSize: "cover",
        backgroundRepeat: "no-repeat",
        width: "1512px",
        height: "740px",
        borderRadius: "8px",
        overflow: "hidden",
      }}
    >
      <input
        className="mstbnb"
        value={invoiceData.taxCode}
        style={{
          position: "absolute",
          left: "298px",
          top: "198px",
          width: "120px",
          height: "30px",
          border: "none",
          background: "transparent",
          fontSize: "12px",
          color: "rgb(70, 70, 70)",
        }}
        readOnly
      />
      <input
        className="khhd"
        value={invoiceData.invoiceSymbol}
        style={{
          position: "absolute",
          left: "298px",
          top: "325px",
          width: "120px",
          height: "30px",
          border: "none",
          background: "transparent",
          fontSize: "12px",
          color: "rgb(70, 70, 70)",
        }}
        readOnly
      />
      <input
        className="shd"
        value={invoiceData.invoiceNumber}
        style={{
          position: "absolute",
          left: "298px",
          top: "389px",
          width: "120px",
          height: "30px",
          border: "none",
          background: "transparent",
          fontSize: "12px",
          color: "rgb(70, 70, 70)",
        }}
        readOnly
      />
      <input
        className="ttt"
        value={Number(invoiceData.totalTax).toLocaleString("de-DE")}
        style={{
          position: "absolute",
          left: "298px",
          top: "454px",
          width: "120px",
          height: "30px",
          border: "none",
          background: "transparent",
          fontSize: "12px",
          color: "rgb(70, 70, 70)",
        }}
        readOnly
      />
      <input
        className="tttt"
        value={Number(invoiceData.totalBill).toLocaleString("de-DE")}
        style={{
          position: "absolute",
          left: "298px",
          top: "519px",
          width: "120px",
          height: "30px",
          border: "none",
          background: "transparent",
          fontSize: "12px",
          color: "rgb(70, 70, 70)",
        }}
        readOnly
      />
      <img
        className="captcha"
        src={`./invoice-template/captcha/image-${
          Math.floor(Math.random() * 10) + 1
        }.png`}
        alt="Captcha"
        style={{
          position: "absolute",
          left: "287px",
          top: "573px",
          width: "120px",
          height: "30px",
          color: "rgb(70, 70, 70)",
        }}
      />
      <input
        className="message"
        value={
          invoiceData.isValid
            ? "Tồn tại hóa đơn có thông tin trùng khớp với các thông tin tổ chức, cá nhân tìm kiếm."
            : "Không tồn tại hóa đơn có thông tin trùng khớp với các thông tin tổ chức, cá nhân tìm kiếm."
        }
        style={{
          position: "absolute",
          left: "610px",
          top: "180px",
          width: "600px",
          height: "30px",
          border: "none",
          background: "transparent",
          fontSize: "14px",
          color: "rgb(70, 70, 70)",
        }}
        readOnly
      />
      <input
        className="message2"
        value={
          invoiceData.isValid
            ? "Trạng thái xử lý hoá đơn: Đã cấp mã hóa đơn"
            : ""
        }
        style={{
          position: "absolute",
          left: "610px",
          top: "210px",
          width: "500px",
          height: "30px",
          border: "none",
          background: "transparent",
          fontSize: "14px",
          color: "rgb(70, 70, 70)",
        }}
        readOnly
      />
    </div>
  );
};

export default InvoiceTemplate;
