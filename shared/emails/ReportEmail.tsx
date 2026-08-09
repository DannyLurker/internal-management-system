import {
    Html,
    Head,
    Body,
    Container,
    Section,
    Heading,
    Text,
    Button,
    Hr,
} from "react-email";

interface ReportEmailProps {
    dateFrom: string;
    dateTo: string;
    downloadUrl: string;
}

export default function ReportEmail({
    dateFrom = "2026-08-01",
    dateTo = "2026-08-09",
    downloadUrl = "#",
}: ReportEmailProps) {
    return (
        <Html>
            <Head />
            <Body
                style={{
                    backgroundColor: "#f8f9ff",
                    fontFamily: "sans-serif",
                    padding: "16px",
                    margin: "0 auto",
                }}
            >
                <Container
                    style={{
                        backgroundColor: "#ffffff",
                        border: "1px solid rgba(216, 195, 180, 0.3)",
                        borderRadius: "8px",
                        margin: "40px auto",
                        padding: "40px",
                        maxWidth: "520px",
                        boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                >
                    {/* Header Brand */}
                    <Section style={{ textAlign: "center", marginBottom: "32px" }}>
                        <Heading
                            style={{
                                fontSize: "28px",
                                fontFamily: "serif",
                                color: "#121c28",
                                fontWeight: "normal",
                                margin: "8px 0 0 0",
                            }}
                        >
                            HMS System Report
                        </Heading>
                    </Section>

                    <Hr style={{ borderColor: "rgba(216, 195, 180, 0.2)", margin: "24px 0" }} />

                    {/* Description */}
                    <Text
                        style={{
                            color: "#524439",
                            fontSize: "15px",
                            lineHeight: "24px",
                            textAlign: "center",
                            marginBottom: "28px",
                        }}
                    >
                        Your requested report has been generated and is ready for download.
                    </Text>

                    {/* Information Card Container */}
                    <Section
                        style={{
                            backgroundColor: "#eef4ff",
                            borderRadius: "8px",
                            padding: "20px",
                            marginBottom: "32px",
                            border: "1px solid rgba(216, 195, 180, 0.2)",
                        }}
                    >
                        <Text
                            style={{
                                fontSize: "11px",
                                fontWeight: 600,
                                color: "#565e74",
                                textTransform: "uppercase",
                                letterSpacing: "0.1em",
                                margin: "0 0 6px 0",
                            }}
                        >
                            Period Details
                        </Text>
                        <Text
                            style={{
                                color: "#121c28",
                                fontSize: "15px",
                                fontWeight: 500,
                                margin: 0,
                            }}
                        >
                            {dateFrom} — {dateTo}
                        </Text>
                    </Section>

                    {/* Primary Action Button (Ochre Brand: #894d0d) */}
                    <Section style={{ textAlign: "center", margin: "36px 0" }}>
                        <Button
                            href={downloadUrl}
                            style={{
                                backgroundColor: "#894d0d",
                                borderRadius: "4px",
                                color: "#ffffff",
                                fontWeight: 500,
                                fontSize: "14px",
                                textDecoration: "none",
                                textAlign: "center",
                                padding: "14px 32px",
                                display: "inline-block",
                            }}
                        >
                            Download PDF Report
                        </Button>
                    </Section>

                    <Text
                        style={{
                            color: "rgba(86, 94, 116, 0.7)",
                            fontSize: "12px",
                            textAlign: "center",
                            margin: 0,
                        }}
                    >
                        This secure link will expire in 7 days.
                    </Text>

                    <Hr style={{ borderColor: "rgba(216, 195, 180, 0.2)", margin: "32px 0" }} />

                    {/* Footer */}
                    <Text
                        style={{
                            color: "rgba(86, 94, 116, 0.6)",
                            fontSize: "11px",
                            textAlign: "center",
                            margin: 0,
                            lineHeight: "18px",
                        }}
                    >
                        This automated email was sent by the Hotel Inventory Management System.
                        <br />
                        Please do not reply directly to this email address.
                    </Text>

                    <Text
                        style={{
                            color: "rgba(86, 94, 116, 0.6)",
                            fontSize: "11px",
                            textAlign: "center",
                            margin: "6px 0 0 0",
                            lineHeight: "18px",
                        }}
                    >
                        {new Date().toLocaleDateString()} at {new Date().getHours()}:{new Date().getMinutes()}
                    </Text>
                </Container>
            </Body>
        </Html>
    );
}