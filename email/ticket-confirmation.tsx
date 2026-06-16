import {
  Body,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Tailwind,
  Text,
} from '@react-email/components';

type TicketConfirmationProps = {
  buyerName: string;
  eventName: string;
  eventDate: Date;
  tierName: string;
  amount: number;
  ticketCode: string;
};

const dateFormatter = new Intl.DateTimeFormat('en-NG', {
  dateStyle: 'full',
  timeStyle: 'short',
});

const currencyFormatter = new Intl.NumberFormat('en-NG', {
  currency: 'NGN',
  style: 'currency',
  minimumFractionDigits: 0,
});

TicketConfirmationEmail.PreviewProps = {
  buyerName: 'John Doe',
  eventName: 'The Frat Night at Spiffy\'s House',
  eventDate: new Date('2026-07-03T20:00:00'),
  tierName: 'Early Bird',
  amount: 6500,
  ticketCode: 'FRAT-AB3K7YMN',
} satisfies TicketConfirmationProps;

export default function TicketConfirmationEmail({
  buyerName,
  eventName,
  eventDate,
  tierName,
  amount,
  ticketCode,
}: TicketConfirmationProps) {
  return (
    <Html>
      <Preview>Your ticket for {eventName} is confirmed!</Preview>
      <Tailwind>
        <Head />
        <Body className="font-sans bg-gray-100">
          <Container className="max-w-xl mx-auto bg-white rounded-lg overflow-hidden">
            {/* Header */}
            <Section className="bg-black px-8 py-10 text-center">
              <Heading className="text-white text-2xl m-0">
                🎟️ Ticket Confirmed!
              </Heading>
              <Text className="text-orange-500 text-lg m-0 mt-2">
                {eventName}
              </Text>
            </Section>

            {/* Body */}
            <Section className="px-8 py-6">
              <Text className="text-gray-800 text-base">
                Hey {buyerName},
              </Text>
              <Text className="text-gray-600 text-base">
                Your ticket has been secured. Here are your details:
              </Text>

              {/* Ticket Details */}
              <Section className="bg-gray-50 rounded-lg p-6 my-4">
                <Text className="text-gray-500 text-sm m-0">Event</Text>
                <Text className="text-gray-900 font-bold text-base m-0 mt-1">
                  {eventName}
                </Text>

                <Text className="text-gray-500 text-sm m-0 mt-4">Date</Text>
                <Text className="text-gray-900 font-bold text-base m-0 mt-1">
                  {dateFormatter.format(eventDate)}
                </Text>

                <Text className="text-gray-500 text-sm m-0 mt-4">Ticket Tier</Text>
                <Text className="text-gray-900 font-bold text-base m-0 mt-1">
                  {tierName}
                </Text>

                <Text className="text-gray-500 text-sm m-0 mt-4">Amount Paid</Text>
                <Text className="text-gray-900 font-bold text-base m-0 mt-1">
                  {currencyFormatter.format(amount)}
                </Text>
              </Section>

              {/* Ticket Code */}
              <Section className="bg-black rounded-lg p-6 my-4 text-center">
                <Text className="text-gray-400 text-xs m-0 uppercase tracking-wider">
                  Your Ticket Code
                </Text>
                <Text
                  className="text-orange-500 font-mono font-bold text-2xl m-0 mt-2"
                  style={{ letterSpacing: '0.15em' }}
                >
                  {ticketCode}
                </Text>
                <Text className="text-gray-400 text-xs m-0 mt-2">
                  Present this code at the door
                </Text>
              </Section>

              <Hr className="border-gray-200 my-6" />

              <Text className="text-gray-500 text-sm">
                📍 <strong>Venue:</strong> The exact location will be shared with
                ticket holders before the event.
              </Text>

              <Text className="text-gray-500 text-sm">
                ⚠️ Tickets are <strong>non-refundable</strong>. Terms &amp; conditions apply.
              </Text>

              <Text className="text-gray-400 text-xs mt-8 text-center">
                Powered by Spiffy — Lead City is where it starts. Nigeria is where we&apos;re going.
              </Text>
            </Section>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  );
}
