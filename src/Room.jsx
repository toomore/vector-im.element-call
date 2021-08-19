/*
Copyright 2021 New Vector Ltd

Licensed under the Apache License, Version 2.0 (the "License");
you may not use this file except in compliance with the License.
You may obtain a copy of the License at

    http://www.apache.org/licenses/LICENSE-2.0

Unless required by applicable law or agreed to in writing, software
distributed under the License is distributed on an "AS IS" BASIS,
WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
See the License for the specific language governing permissions and
limitations under the License.
*/

import React, { useEffect, useMemo, useRef, useState } from "react";
import styles from "./Room.module.css";
import { useParams, useLocation, Link } from "react-router-dom";
import { useVideoRoom } from "./ConferenceCallManagerHooks";
import { DevTools } from "./DevTools";
import { VideoGrid } from "./VideoGrid";
import {
  HangupButton,
  SettingsButton,
  MicButton,
  VideoButton,
} from "./RoomButton";
import { ReactComponent as Logo } from "./Logo.svg";

function useQuery() {
  const location = useLocation();
  return useMemo(() => new URLSearchParams(location.search), [location.search]);
}

export function Room({ manager }) {
  const { roomId } = useParams();
  const query = useQuery();
  const {
    loading,
    joined,
    joining,
    room,
    participants,
    error,
    joinCall,
    leaveCall,
  } = useVideoRoom(manager, roomId);
  const debugStr = query.get("debug");
  const [debug, setDebug] = useState(debugStr === "" || debugStr === "true");

  useEffect(() => {
    function onKeyDown(event) {
      if (
        document.activeElement.tagName !== "input" &&
        event.code === "Backquote"
      ) {
        setDebug((prevDebug) => !prevDebug);
      }
    }

    window.addEventListener("keydown", onKeyDown);

    return () => {
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <div className={styles.room}>
      {!loading && room && (
        <div className={styles.header}>
          <div className={styles.backNav}>
            <Link className={styles.logo} to="/">
              <Logo width={32} height={32} />
            </Link>
          </div>
          <h3>{room.name}</h3>
          <div className={styles.userNav}>
            <SettingsButton
              title={debug ? "Disable DevTools" : "Enable DevTools"}
              on={debug}
              onClick={() => setDebug((debug) => !debug)}
            />
          </div>
        </div>
      )}
      {loading && (
        <div className={styles.centerMessage}>
          <p>Loading room...</p>
        </div>
      )}
      {error && <div className={styles.centerMessage}>{error.message}</div>}
      {!loading && room && !joined && (
        <div className={styles.joinRoom}>
          <h3>Members:</h3>
          <ul>
            {room.getMembers().map((member) => (
              <li key={member.userId}>{member.name}</li>
            ))}
          </ul>
          <button disabled={joining} onClick={joinCall}>
            Join Call
          </button>
        </div>
      )}
      {!loading && room && joined && participants.length === 0 && (
        <div className={styles.centerMessage}>
          <p>Waiting for other participants...</p>
        </div>
      )}
      {!loading && room && joined && participants.length > 0 && (
        <VideoGrid participants={participants} />
      )}
      {!loading && room && joined && (
        <div className={styles.footer}>
          <MicButton />
          <VideoButton />
          <HangupButton onClick={leaveCall} />
        </div>
      )}
      {debug && <DevTools manager={manager} />}
    </div>
  );
}
