import { useSyncExternalStore } from "react";

const subscribe = () => () => {};
const getSnapshot = () => true;
const getServerSnapshot = () => false;

export default function useHydrated() {
	return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}
