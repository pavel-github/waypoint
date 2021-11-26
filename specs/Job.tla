-------------------------------- MODULE Job ------------------------------------

EXTENDS Naturals
CONSTANT Runner
VARIABLE jobs, runnerState, serverInbox

--------------------------------------------------------------------------------

vars == <<jobs, runnerState, serverInbox>>

--------------------------------------------------------------------------------
(******************************************************************************)
(* Types                                                                      *)
(******************************************************************************)

Job == {"INIT"}
RunnerState == {"READY"}
RunnerJobStreamMsg == {"ACCEPT"}
RunnerJobStreamReq == [ sender : Runner, message : RunnerJobStreamMsg ]

--------------------------------------------------------------------------------

TypeOK ==
  /\ jobs \subseteq Job
  /\ serverInbox \subseteq RunnerJobStreamReq
  /\ runnerState \in [ Runner -> RunnerState ]

--------------------------------------------------------------------------------
(******************************************************************************)
(* Helpers                                                                    *)
(******************************************************************************)

req(sender, message) ==
  [ sender |-> sender, message |-> message ]

--------------------------------------------------------------------------------

ServerRecvJob ==
  \E job \in Job :
    /\ jobs' = jobs \cup {job}
    /\ UNCHANGED <<runnerState, serverInbox>>

RunnerSendRequest ==
  \E runner \in Runner :
    /\ runnerState[runner] = "READY"
    /\ serverInbox' = serverInbox \cup { req(runner, "REQUEST") }
    /\ UNCHANGED <<jobs, runnerState>>

ServerRecvRequest ==
  TRUE \* TODO
  
--------------------------------------------------------------------------------

Init ==
  /\ jobs = {}
  /\ serverInbox = {}
  /\ runnerState = [ r \in Runner |-> "READY" ]

Next ==
  \/ ServerRecvJob
  \/ RunnerSendRequest
  \/ ServerRecvRequest

Spec == Init /\ [][Next]_vars

--------------------------------------------------------------------------------

Safety ==
  TRUE

Liveness ==
  TRUE

================================================================================
