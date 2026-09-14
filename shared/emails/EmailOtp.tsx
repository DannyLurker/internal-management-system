import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  //   Img,
  Link,
  Preview,
  Section,
  Text,
} from "react-email";

interface EmailOtpTemplateProps {
  userName: string;
  otpCode: string;
  expirationMinutes: number;
  hotelName: string;
  supportEmail: string;
  verificationUrl: string;
  //   logoUrl?: string;
}

export const EmailOtpTemplate = ({
  userName = "Valued Guest",
  otpCode = "849201",
  expirationMinutes = 15,
  hotelName = "BIZ HOTEL",
  supportEmail = "www.bizhotel.com",
  verificationUrl,
  //   logoUrl = "/biz-hotel.jpg",
}: EmailOtpTemplateProps) => {
  // Handling split code display for improved legibility (3 digits - 3 digits)
  const formattedCode =
    otpCode.length === 6
      ? `${otpCode.slice(0, 3)} - ${otpCode.slice(3, 6)}`
      : otpCode;

  return (
    <Html>
      <Head>
        <style>{`
          @import url('https://fonts.googleapis.com/css2?family=EB+Garamond:wght@500;600&family=Hanken+Grotesk:wght@400;500;600&display=swap');
          body {
            font-family: 'Hanken Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            background-color: #f8f9ff;
            margin: 0;
            padding: 0;
          }
        `}</style>
      </Head>
      <Preview>
        Your verification code for {hotelName}: {otpCode}
      </Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Handling Brand Header */}
          <Section style={styles.headerSection}>
            <Text style={styles.brandTitle}>{hotelName.toUpperCase()}</Text>
          </Section>

          {/* Handling Main Verification Card */}
          <Section style={styles.card}>
            <Heading style={styles.heading}>Verify Your Account</Heading>

            <Text style={styles.paragraph}>Hello {userName},</Text>

            <Text style={styles.paragraph}>
              Please use the verification code below to complete your
              authentication request. This code is valid for the next{" "}
              <strong>{expirationMinutes} minutes</strong>.
            </Text>

            {/* Handling OTP Display Box */}
            <Section style={styles.otpContainer}>
              <Text style={styles.otpLabel}>ONE-TIME VERIFICATION CODE</Text>
              <Text style={styles.otpCode}>{formattedCode}</Text>
            </Section>

            <Text style={styles.warningText}>
              If you did not request this verification code, please ignore this
              email or contact our concierge team immediately.
            </Text>

            {/* Handling Primary Call-to-Action Button */}
            <Section style={styles.buttonContainer}>
              <Button style={styles.button} href={verificationUrl}>
                Verify Account
              </Button>
            </Section>

            <Hr style={styles.divider} />

            {/* Handling Security Footnote */}
            <Text style={styles.footerHelp}>
              Need assistance? Contact our team at{" "}
              <Link href={`mailto:${supportEmail}`} style={styles.link}>
                {supportEmail}
              </Link>
            </Text>
          </Section>

          {/* Handling Email Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              © {new Date().getFullYear()} {hotelName}. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
};

export default EmailOtpTemplate;

// Handling inline style definitions based on Ochre Harbor design system
const styles = {
  body: {
    backgroundColor: "#f8f9ff",
    margin: "0 auto",
    padding: "40px 0",
    fontFamily: "'Hanken Grotesk', sans-serif",
  },
  container: {
    maxWidth: "560px",
    margin: "0 auto",
    padding: "0 20px",
  },
  headerSection: {
    textAlign: "center" as const,
    marginBottom: "24px",
  },
  logo: {
    margin: "0 auto 12px auto",
    borderRadius: "4px",
  },
  brandTitle: {
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: "12px",
    fontWeight: "600",
    letterSpacing: "0.15em",
    color: "#524439",
    margin: "0",
  },
  card: {
    backgroundColor: "#ffffff",
    borderRadius: "8px",
    padding: "40px",
    border: "1px solid #d9e3f4",
    boxShadow: "0px 4px 12px rgba(18, 28, 40, 0.04)",
  },
  heading: {
    fontFamily: "'EB Garamond', Georgia, serif",
    fontSize: "32px",
    fontWeight: "500",
    lineHeight: "40px",
    color: "#121c28",
    marginTop: "0",
    marginBottom: "20px",
  },
  paragraph: {
    fontSize: "16px",
    lineHeight: "24px",
    color: "#524439",
    marginBottom: "16px",
  },
  otpContainer: {
    backgroundColor: "#eef4ff",
    borderRadius: "4px",
    padding: "24px",
    textAlign: "center" as const,
    marginTop: "24px",
    marginBottom: "24px",
    borderLeft: "4px solid #894d0d",
  },
  otpLabel: {
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: "11px",
    fontWeight: "600",
    letterSpacing: "0.1em",
    color: "#894d0d",
    margin: "0 0 8px 0",
  },
  otpCode: {
    fontFamily: "'Hanken Grotesk', monospace",
    fontSize: "36px",
    fontWeight: "600",
    letterSpacing: "0.15em",
    color: "#121c28",
    margin: "0",
  },
  warningText: {
    fontSize: "14px",
    lineHeight: "20px",
    color: "#857467",
    marginBottom: "24px",
  },
  divider: {
    borderColor: "#e5eeff",
    margin: "24px 0",
  },
  footerHelp: {
    fontSize: "14px",
    color: "#524439",
    margin: "0",
  },
  link: {
    color: "#894d0d",
    textDecoration: "underline",
  },
  footer: {
    textAlign: "center" as const,
    marginTop: "32px",
  },
  footerText: {
    fontSize: "12px",
    color: "#857467",
    margin: "0 0 4px 0",
  },
  footerAddress: {
    fontSize: "12px",
    color: "#857467",
    margin: "0",
  },
  buttonContainer: {
    textAlign: "center" as const,
    marginTop: "28px",
    marginBottom: "28px",
  },
  button: {
    backgroundColor: "#894d0d", // Primary Ochre
    borderRadius: "4px",
    color: "#ffffff",
    fontFamily: "'Hanken Grotesk', sans-serif",
    fontSize: "15px",
    fontWeight: "600",
    textDecoration: "none",
    textAlign: "center" as const,
    display: "inline-block",
    padding: "12px 32px",
    lineHeight: "20px",
  },
};
