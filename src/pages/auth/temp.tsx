import React from "react";
import { saveAs } from "file-saver";
import QRCode from "react-qr-code";
import {
  pdf,
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  Image,
} from "@react-pdf/renderer";

// PDF Document Component
const LetterPDF = () => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <View style={styles.companyInfo}>
          <Text style={styles.companyName}>MEGACODE CO. LIMITED</Text>
          <Text style={styles.tagline}>
            Transforming ideas into digital reality
          </Text>
          <View style={styles.addressContainer}>
            <Text style={styles.address}>
              183633, Kampala, Uganda | P.O. Box 183633, Kampala
            </Text>
            <Text style={styles.address}>
              Location: Makindye, Luwafu | Tel: 0775563805
            </Text>
          </View>
        </View>
        <View style={styles.qrContainer}>
          <Image
            style={styles.qrCode}
            src={`data:image/svg+xml;utf8,${encodeURIComponent(
              <QRCode
                value="https://megacodeug.netlify.app/"
                size={80}
                fgColor="#1e3a8a"
                level="H"
              />
            )}`}
          />
          <Text style={styles.qrText}>Scan for details</Text>
        </View>
      </View>

      {/* Letter Content */}
      <View style={styles.content}>
        <Text style={styles.date}>5/05/2025</Text>

        <View style={styles.recipient}>
          <Text>Belinda</Text>
          <Text>Intern Candidate</Text>
          <Text>[Institution Name]</Text>
          <Text>[Address]</Text>
        </View>

        <Text style={styles.subject}>INTERNSHIP APPOINTMENT LETTER</Text>

        <View style={styles.body}>
          <Text style={styles.greeting}>Dear Belinda,</Text>

          <Text style={styles.paragraph}>
            We are pleased to inform you that you have been accepted to
            undertake your internship with Megacode Co. Ltd. This internship
            opportunity is offered in recognition of your interest and
            demonstrated potential in the field of software development.
          </Text>

          <Text style={styles.paragraph}>
            You will be attached to the Frontend Development Team, where you
            will work alongside our experienced developers on real-world
            projects. The internship will expose you to modern frontend
            technologies, team collaboration practices, and industry standards.
          </Text>

          <Text style={styles.sectionTitle}>Internship Details:</Text>

          <View style={styles.details}>
            <Text style={styles.detailItem}>
              <Text style={styles.detailLabel}>Department:</Text> Frontend
              Development
            </Text>
            <Text style={styles.detailItem}>
              <Text style={styles.detailLabel}>Supervisor:</Text> Zziwa Raymond
              Ian, Development Team Lead
            </Text>
            <Text style={styles.detailItem}>
              <Text style={styles.detailLabel}>Duration:</Text> [Insert Start
              Date] to [Insert End Date]
            </Text>
            <Text style={styles.detailItem}>
              <Text style={styles.detailLabel}>Location:</Text> Megacode Co.
              Ltd, Makindye, Luwafu
            </Text>
            <Text style={styles.detailItem}>
              <Text style={styles.detailLabel}>Working Hours:</Text> Monday to
              Friday, 9:00 AM to 5:00 PM
            </Text>
          </View>

          <Text style={styles.paragraph}>
            Please note that this internship is unpaid and is intended solely
            for educational and professional development purposes. You are
            expected to maintain professionalism, adhere to our company's code
            of conduct, and actively participate in the team's activities.
          </Text>

          <Text style={styles.paragraph}>
            Upon successful completion, the team shall assess your abilities and
            if you are found competent enough, you will stand a chance of being
            retained on a part-time basis.
          </Text>

          <Text style={styles.paragraph}>
            Kindly confirm your acceptance of this offer by signing and
            returning a copy of this letter.
          </Text>

          <Text style={styles.paragraph}>
            We look forward to working with you and contributing to your
            learning journey.
          </Text>

          <View style={styles.signature}>
            <Text>Sincerely,</Text>
            <View style={styles.signatureSpace} />
            <Text style={styles.signatureName}>Nsereko Byrone</Text>
            <Text style={styles.signatureTitle}>Director</Text>
            <Text style={styles.company}>MEGACODE CO. LIMITED</Text>
          </View>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>
          Email: info@megacode.co.ug | Website: megacodeug.netlify.app
        </Text>
        <Text style={styles.footerTagline}>
          Transforming ideas into digital reality
        </Text>
      </View>
    </Page>
  </Document>
);

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontFamily: "Helvetica",
    fontSize: 11,
    lineHeight: 1.4,
    color: "#333333",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: "#1e3a8a",
    borderBottomStyle: "solid",
    paddingBottom: 15,
  },
  companyInfo: {
    width: "70%",
  },
  companyName: {
    fontSize: 14,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 4,
  },
  tagline: {
    fontSize: 9,
    color: "#666666",
    fontStyle: "italic",
    marginBottom: 8,
  },
  addressContainer: {
    fontSize: 9,
    color: "#555555",
    lineHeight: 1.3,
  },
  address: {
    marginBottom: 3,
  },
  qrContainer: {
    width: "25%",
    alignItems: "flex-end",
  },
  qrCode: {
    width: 60,
    height: 60,
  },
  qrText: {
    fontSize: 8,
    color: "#666666",
    marginTop: 4,
  },
  content: {
    marginTop: 5,
  },
  date: {
    marginBottom: 15,
    fontSize: 10,
    color: "#555555",
  },
  recipient: {
    marginBottom: 15,
    fontSize: 10,
  },
  subject: {
    fontSize: 12,
    fontWeight: "bold",
    color: "#1e3a8a",
    marginBottom: 15,
  },
  body: {
    fontSize: 11,
  },
  greeting: {
    marginBottom: 10,
  },
  paragraph: {
    marginBottom: 10,
    textAlign: "justify",
  },
  sectionTitle: {
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 8,
    color: "#1e3a8a",
  },
  details: {
    marginLeft: 10,
    marginBottom: 12,
  },
  detailItem: {
    marginBottom: 5,
  },
  detailLabel: {
    fontWeight: "bold",
  },
  signature: {
    marginTop: 30,
  },
  signatureSpace: {
    height: 30,
    marginVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: "#cccccc",
    borderBottomStyle: "solid",
    width: 150,
  },
  signatureName: {
    fontWeight: "bold",
    marginTop: 5,
  },
  signatureTitle: {
    fontWeight: "bold",
    marginTop: 2,
    fontSize: 10,
  },
  company: {
    fontWeight: "bold",
    color: "#1e3a8a",
    marginTop: 2,
    fontSize: 10,
  },
  footer: {
    position: "absolute",
    bottom: 30,
    left: 40,
    right: 40,
    fontSize: 9,
    color: "#555555",
    textAlign: "center",
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: "#eeeeee",
    borderTopStyle: "solid",
  },
  footerTagline: {
    fontStyle: "italic",
    marginTop: 4,
    fontSize: 9,
  },
});

const InternshipAppointmentLetter = () => {
  const handleDownloadPDF = async () => {
    const blob = await pdf(<LetterPDF />).toBlob();
    saveAs(blob, "Megacode_Internship_Offer.pdf");
  };

  return (
    <div className="min-h-screen p-8 bg-gray-50">
      {/* Letter Container */}
      <div className="max-w-4xl mx-auto bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        {/* Header */}
        <header className="p-6 border-b border-gray-200">
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <h1 className="text-xl font-bold text-blue-900">
                MEGACODE CO. LIMITED
              </h1>
              <p className="text-xs text-gray-500 italic mt-1">
                Transforming ideas into digital reality
              </p>

              <div className="mt-3 text-xs text-gray-600 space-y-1">
                <p>183633, Kampala, Uganda | P.O. Box 183633, Kampala</p>
                <p>Location: Makindye, Luwafu | Tel: 0775563805</p>
              </div>
            </div>

            <div className="flex flex-col items-end">
              <div className="bg-white p-1 rounded border border-gray-200">
                <QRCode
                  value="https://megacodeug.netlify.app/"
                  size={70}
                  level="H"
                  fgColor="#1e3a8a"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Scan for details</p>
            </div>
          </div>
        </header>

        {/* Letter Content */}
        <main className="p-8">
          <div className="mb-8">
            <p className="text-sm text-gray-500 mb-6">5/05/2025</p>

            <div className="mb-6 text-sm space-y-1">
              <p>Belinda</p>
              <p>Intern Candidate</p>
              <p>[Institution Name]</p>
              <p>[Address]</p>
            </div>

            <p className="font-bold text-blue-900 text-base mb-4">
              INTERNSHIP APPOINTMENT LETTER
            </p>

            <div className="text-sm text-gray-700 space-y-3 leading-relaxed">
              <p>Dear Belinda,</p>

              <p>
                We are pleased to inform you that you have been accepted to
                undertake your internship with Megacode Co. Ltd. This internship
                opportunity is offered in recognition of your interest and
                demonstrated potential in the field of software development.
              </p>

              <p>
                You will be attached to the Frontend Development Team, where you
                will work alongside our experienced developers on real-world
                projects. The internship will expose you to modern frontend
                technologies, team collaboration practices, and industry
                standards.
              </p>

              <p className="font-medium text-blue-900 mt-4">
                Internship Details:
              </p>

              <ul className="list-disc pl-5 space-y-1">
                <li>
                  <span className="font-medium">Department:</span> Frontend
                  Development
                </li>
                <li>
                  <span className="font-medium">Supervisor:</span> Zziwa Raymond
                  Ian, Development Team Lead
                </li>
                <li>
                  <span className="font-medium">Duration:</span> [Insert Start
                  Date] to [Insert End Date]
                </li>
                <li>
                  <span className="font-medium">Location:</span> Megacode Co.
                  Ltd, Makindye, Luwafu
                </li>
                <li>
                  <span className="font-medium">Working Hours:</span> Monday to
                  Friday, 9:00 AM to 5:00 PM
                </li>
              </ul>

              <p>
                Please note that this internship is unpaid and is intended
                solely for educational and professional development purposes.
                You are expected to maintain professionalism, adhere to our
                company's code of conduct, and actively participate in the
                team's activities.
              </p>

              <p>
                Upon successful completion, the team shall assess your abilities
                and if you are found competent enough, you will stand a chance
                of being retained on a part-time basis.
              </p>

              <p>
                Kindly confirm your acceptance of this offer by signing and
                returning a copy of this letter.
              </p>

              <p>
                We look forward to working with you and contributing to your
                learning journey.
              </p>

              <div className="mt-8 space-y-1">
                <p>Sincerely,</p>
                <div className="h-16"></div>
                <p className="font-medium">Nsereko Byrone</p>
                <p className="font-medium">Director</p>
                <p className="font-medium text-blue-900">
                  MEGACODE CO. LIMITED
                </p>
              </div>
            </div>
          </div>
        </main>

        {/* Footer */}
        <footer className="bg-gray-100 p-4 border-t border-gray-200">
          <div className="flex flex-col text-center text-xs text-gray-600">
            <p>Email: info@megacode.co.ug | Website: megacodeug.netlify.app</p>
            <p className="italic mt-1">
              Transforming ideas into digital reality
            </p>
          </div>
        </footer>
      </div>

      {/* Download PDF Button */}
      <button
        onClick={handleDownloadPDF}
        className="fixed bottom-8 right-8 bg-blue-900 hover:bg-blue-800 text-white px-4 py-2 rounded shadow transition flex items-center space-x-2 text-sm"
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-4 w-4"
          viewBox="0 0 20 20"
          fill="currentColor"
        >
          <path
            fillRule="evenodd"
            d="M3 17a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm3.293-7.707a1 1 0 011.414 0L9 10.586V3a1 1 0 112 0v7.586l1.293-1.293a1 1 0 111.414 1.414l-3 3a1 1 0 01-1.414 0l-3-3a1 1 0 010-1.414z"
            clipRule="evenodd"
          />
        </svg>
        <span>Download PDF</span>
      </button>
    </div>
  );
};

export default InternshipAppointmentLetter;
