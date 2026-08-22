"""
Base Abstract Agent for KYZER Multi-Agent System.
Defines agent interface, state mutation hooks, and communication protocols.
"""

import logging
from abc import ABC, abstractmethod
from typing import Dict, Any, Optional

from ai_engine.agents.state import MultiAgentBlackboardState, AgentMessage

logger = logging.getLogger("ai_engine.agents")

class BaseKYZERAgent(ABC):
    """Abstract base class for domain-specific autonomous healthcare agents."""

    def __init__(self, agent_name: str, role_description: str):
        self.agent_name = agent_name
        self.role_description = role_description
        self.logger = logging.getLogger(f"ai_engine.agents.{agent_name.lower()}")

    @abstractmethod
    def process_state(self, state: MultiAgentBlackboardState) -> MultiAgentBlackboardState:
        """
        Reads current blackboard state, executes domain reasoning,
        mutates state, and logs inter-agent communication messages.
        """
        pass

    def emit_message(
        self,
        state: MultiAgentBlackboardState,
        recipient: str,
        message_type: str,
        payload: Dict[str, Any],
        priority: str = "NORMAL"
    ) -> None:
        """Appends a structured inter-agent communication message to the audit log."""
        msg = AgentMessage(
            sender_agent=self.agent_name,
            recipient_agent=recipient,
            message_type=message_type,
            payload=payload,
            priority=priority
        )
        state.agent_message_log.append(msg)
        state.execution_steps.append(f"[{self.agent_name}] -> [{recipient}]: {message_type}")
        self.logger.info(f"Emitted message to {recipient}: {message_type} (Priority: {priority})")
