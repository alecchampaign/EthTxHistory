import type { Transaction } from "../types";

type Action = "Received" | "Sent";
const ACTION = {
  received: "Received",
  sent: "Sent",
} as const;

interface TxHistoryListEntryProps {
  transaction: Transaction;
  publicAddresses: string[];
}

export function TxHistoryListEntry({
  transaction,
  publicAddresses,
}: TxHistoryListEntryProps) {
  const { to, from, value } = transaction;
  const action: Action = publicAddresses.includes(to)
    ? ACTION.received
    : ACTION.sent;

  return (
    <button className="TxEntry">
      <div>
        <span>Ether</span>
      </div>
      <div className="TxEntry_Action">
        <span>{action}</span>
        <span>
          {action === ACTION.received ? "from" : "to"}{" "}
          {action === ACTION.received ? from : to}
        </span>
      </div>
      <div>
        <span>{`${value} ETH`}</span>
      </div>
    </button>
  );
}
