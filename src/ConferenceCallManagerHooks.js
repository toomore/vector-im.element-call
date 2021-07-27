import { useCallback, useEffect, useState } from "react";
import { ConferenceCallManager } from "./ConferenceCallManager";

export function useConferenceCallManager(homeserverUrl) {
  const [{ loading, authenticated, manager, error }, setState] = useState({
    loading: true,
    authenticated: false,
    manager: undefined,
    error: undefined,
  });

  useEffect(() => {
    ConferenceCallManager.restore(homeserverUrl)
      .then((manager) => {
        console.log(manager);
        setState({
          manager,
          loading: false,
          authenticated: !!manager,
          error: undefined,
        });
      })
      .catch((err) => {
        console.error(err);

        setState({
          manager: undefined,
          loading: false,
          authenticated: false,
          error: err,
        });
      });
  }, []);

  const login = useCallback(async (username, password) => {
    setState((prevState) => ({
      ...prevState,
      authenticated: false,
      error: undefined,
    }));

    ConferenceCallManager.login(homeserverUrl, username, password)
      .then((manager) => {
        setState({
          manager,
          loading: false,
          authenticated: true,
          error: undefined,
        });
      })
      .catch((err) => {
        console.error(err);

        setState({
          manager: undefined,
          loading: false,
          authenticated: false,
          error: err,
        });
      });
  }, []);

  const register = useCallback(async (username, password) => {
    setState((prevState) => ({
      ...prevState,
      authenticated: false,
      error: undefined,
    }));

    ConferenceCallManager.register(homeserverUrl, username, password)
      .then((manager) => {
        setState({
          manager,
          loading: false,
          authenticated: true,
          error: undefined,
        });
      })
      .catch((err) => {
        console.error(err);

        setState({
          manager: undefined,
          loading: false,
          authenticated: false,
          error: err,
        });
      });
  }, []);

  return { loading, authenticated, manager, error, login, register };
}

export function useVideoRoom(manager, roomId, timeout = 5000) {
  const [{ loading, joined, room, participants, error }, setState] = useState({
    loading: true,
    joined: false,
    room: undefined,
    participants: [],
    error: undefined,
  });

  useEffect(() => {
    setState((prevState) => ({
      ...prevState,
      loading: true,
      room: undefined,
      error: undefined,
    }));

    manager.client.joinRoom(roomId).catch((err) => {
      setState((prevState) => ({ ...prevState, loading: false, error: err }));
    });

    let initialRoom = manager.client.getRoom(roomId);

    if (initialRoom) {
      setState((prevState) => ({
        ...prevState,
        loading: false,
        room: initialRoom,
        error: undefined,
      }));
      return;
    }

    let timeoutId;

    function roomCallback(room) {
      if (room && room.roomId === roomId) {
        clearTimeout(timeoutId);
        manager.client.removeListener("Room", roomCallback);
        setState((prevState) => ({
          ...prevState,
          loading: false,
          room,
          error: undefined,
        }));
      }
    }

    manager.client.on("Room", roomCallback);

    timeoutId = setTimeout(() => {
      setState((prevState) => ({
        ...prevState,
        loading: false,
        room: undefined,
        error: new Error("Room could not be found."),
      }));
      manager.client.removeListener("Room", roomCallback);
    }, timeout);

    return () => {
      manager.client.removeListener("Room", roomCallback);
      clearTimeout(timeoutId);
    };
  }, [roomId]);

  const joinCall = useCallback(() => {
    const onParticipantsChanged = () => {
      setState((prevState) => ({
        ...prevState,
        participants: manager.participants,
      }));
    };

    manager.on("participants_changed", onParticipantsChanged);

    manager.join(roomId);

    setState((prevState) => ({
      ...prevState,
      joined: true,
    }));

    return () => {
      manager.removeListener("participants_changed", onParticipantsChanged);

      setState((prevState) => ({
        ...prevState,
        joined: false,
        participants: [],
      }));
    };
  }, [manager, roomId]);

  return { loading, joined, room, participants, error, joinCall };
}