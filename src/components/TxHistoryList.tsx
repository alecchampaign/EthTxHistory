import { useEffect, useState, useMemo, useRef } from "react";
import type { Transaction } from "../types";
import { TxHistoryListEntry } from "./TxHistoryListEntry";

const apiKey = import.meta.env.VITE_ETHERSCAN_API_KEY;

interface FetchTransactionResult {
  status: string;
  message: string;
  result: Transaction[];
}

interface TxHistoryListProps {
  publicAddresses: string[];
}

export function TxHistoryList({ publicAddresses }: TxHistoryListProps) {
  const [transactions, setTransactions] = useState<Array<Transaction>>([]);
  const [page, setPage] = useState(1);
  const offset = 30;

  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const isLoading = useRef(false);

  useEffect(() => {
    publicAddresses.forEach((address) =>
      fetch(
        `https://api.etherscan.io/api?module=account&action=txlist&address=${address}&startblock=0&endblock=99999999&page=${page}&offset=${offset}&sort=desc&apikey=${apiKey}`
      )
        .then((res) => {
          if (!res.ok) {
            throw new Error("Response not okay, status: " + res.status);
          }
          return res.json();
        })
        .then((data: FetchTransactionResult) => {
          setTransactions((prev) => [...prev, ...data.result]);
          isLoading.current = false;
        })
        .catch((error) => console.error("An error occurred: " + error))
    );
  }, [page]);

  useEffect(() => {
    if (!sentinelRef.current) return;

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting && !isLoading.current) {
          isLoading.current = true;
          setPage((prev) => prev + 1);
        }
      },
      { threshold: 1 }
    );

    observer.observe(sentinelRef.current);

    return () => {
      if (sentinelRef.current) {
        observer.unobserve(sentinelRef.current);
      }
    };
  }, []);

  const deDupedTransactions = useMemo(() => {
    const seen = new Set<string>();
    return transactions.filter((tx) => {
      if (seen.has(tx.hash)) {
        return false;
      }
      seen.add(tx.hash);
      return true;
    });
  }, [transactions]);

  return (
    <>
      <ul>
        {deDupedTransactions.map((transaction) => (
          <TxHistoryListEntry
            transaction={transaction}
            publicAddresses={publicAddresses}
          />
        ))}
      </ul>
      <div style={{ height: 1 }} ref={sentinelRef}></div>
    </>
  );
}
