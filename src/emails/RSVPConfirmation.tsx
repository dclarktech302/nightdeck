import {
  Html, Head, Body, Container, Section,
  Text, Heading, Hr, Link, Preview,
} from 'react-email'

interface RSVPConfirmationProps {
  firstName:        string
  eventName:        string
  eventDate:        string
  eventTime:        string
  venueName:        string | null
  venueAddress:     string | null
  doorPrice:        string
  confirmationCode: string
  partySize:        number
}

export function RSVPConfirmation({
  firstName,
  eventName,
  eventDate,
  eventTime,
  venueName,
  venueAddress,
  doorPrice,
  confirmationCode,
  partySize,
}: RSVPConfirmationProps) {

  // QR code via Google Charts API — free, no auth needed, reliable
  // Encodes the confirmation_code UUID as the QR content
  const qrUrl = `https://chart.googleapis.com/chart?chs=200x200&cht=qr&chl=${confirmationCode}&choe=UTF-8`

  return (
    <Html>
      <Head />
      <Preview>You&apos;re on the list for {eventName}</Preview>
      <Body style={styles.body}>
        <Container style={styles.container}>

          {/* Header */}
          <Section style={styles.header}>
            <Text style={styles.eyebrow}>Shore Pulse</Text>
            <Heading style={styles.heading}>You&apos;re on the list.</Heading>
            <Text style={styles.subheading}>
              Hey {firstName} — your spot is confirmed.
            </Text>
          </Section>

          <Hr style={styles.divider} />

          {/* Event details */}
          <Section style={styles.section}>
            <Heading as="h2" style={styles.sectionTitle}>{eventName}</Heading>
            <Text style={styles.detail}>
              <span style={styles.label}>Date</span> {eventDate}
            </Text>
            <Text style={styles.detail}>
              <span style={styles.label}>Time</span> {eventTime}
            </Text>
            {venueName && (
              <Text style={styles.detail}>
                <span style={styles.label}>Venue</span> {venueName}
                {venueAddress ? ` · ${venueAddress}` : ''}
              </Text>
            )}
            <Text style={styles.detail}>
              <span style={styles.label}>Cover</span> {doorPrice}
            </Text>
            <Text style={styles.detail}>
              <span style={styles.label}>Party</span> {partySize} {partySize === 1 ? 'person' : 'people'}
            </Text>
          </Section>

          <Hr style={styles.divider} />

          {/* QR code */}
          <Section style={styles.qrSection}>
            <Text style={styles.qrLabel}>Your check-in code</Text>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={qrUrl}
              alt="QR check-in code"
              width={160}
              height={160}
              style={styles.qrImage}
            />
            <Text style={styles.qrSub}>
              Show this at the door. One scan per entry.
            </Text>
            <Text style={styles.codeText}>{confirmationCode}</Text>
          </Section>

          <Hr style={styles.divider} />

          {/* Footer */}
          <Section style={styles.footer}>
            <Text style={styles.footerText}>
              Questions? Reply to this email.
            </Text>
            <Text style={styles.footerText}>
              <Link href="https://shorepulse.com" style={styles.link}>
                Shore Pulse
              </Link>
              {' · '}Built by Denkore Group
            </Text>
          </Section>

        </Container>
      </Body>
    </Html>
  )
}

// Inline styles — required for email clients which strip external CSS
const gold = '#c9a84c'

const styles = {
  body: {
    backgroundColor: '#000000',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
    margin: '0',
    padding: '0',
  },
  container: {
    maxWidth: '520px',
    margin: '0 auto',
    padding: '40px 24px',
  },
  header: {
    textAlign: 'center' as const,
    paddingBottom: '24px',
  },
  eyebrow: {
    fontSize: '11px',
    letterSpacing: '0.3em',
    textTransform: 'uppercase' as const,
    color: gold,
    margin: '0 0 16px',
  },
  heading: {
    fontSize: '32px',
    fontWeight: '700',
    color: '#f5f5f5',
    margin: '0 0 8px',
    letterSpacing: '-0.02em',
  },
  subheading: {
    fontSize: '15px',
    color: 'rgba(255,255,255,0.5)',
    margin: '0',
  },
  divider: {
    borderColor: 'rgba(255,255,255,0.08)',
    margin: '24px 0',
  },
  section: {
    padding: '0',
  },
  sectionTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#f5f5f5',
    margin: '0 0 16px',
    letterSpacing: '-0.01em',
  },
  detail: {
    fontSize: '14px',
    color: 'rgba(255,255,255,0.5)',
    margin: '0 0 8px',
    lineHeight: '1.5',
  },
  label: {
    color: gold,
    fontWeight: '600',
    marginRight: '8px',
  },
  qrSection: {
    textAlign: 'center' as const,
    padding: '8px 0',
  },
  qrLabel: {
    fontSize: '11px',
    letterSpacing: '0.25em',
    textTransform: 'uppercase' as const,
    color: 'rgba(255,255,255,0.3)',
    margin: '0 0 16px',
  },
  qrImage: {
    display: 'block',
    margin: '0 auto',
    borderRadius: '8px',
  },
  qrSub: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.3)',
    margin: '12px 0 4px',
  },
  codeText: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.15)',
    fontFamily: 'monospace',
    letterSpacing: '0.05em',
    margin: '0',
  },
  footer: {
    textAlign: 'center' as const,
  },
  footerText: {
    fontSize: '12px',
    color: 'rgba(255,255,255,0.2)',
    margin: '0 0 4px',
  },
  link: {
    color: gold,
    textDecoration: 'none',
  },
}