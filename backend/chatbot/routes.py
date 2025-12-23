from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity, verify_jwt_in_request

from .chat_history_mongo import (
    create_new_conversation,
    save_message,
    get_conversation,
    list_conversations,
    delete_conversation,
    update_conversation_title,
)

from .providers import generate_response


chatbot_bp = Blueprint("chatbot_bp", __name__)


def _get_user_id() -> str:
    """Extract user_id primarily from JWT; fallback to header/body/query for development flexibility."""
    try:
        verify_jwt_in_request(optional=True)
        uid = get_jwt_identity()
        if uid:
            return str(uid)
    except Exception:
        pass

    user_id = request.headers.get("X-User-Id")
    if not user_id:
        data = request.get_json(silent=True) or {}
        user_id = data.get("user_id") or request.args.get("user_id")
    return user_id


@chatbot_bp.route("/chatbot", methods=["POST"])
@jwt_required()
def chatbot():
    try:
        data = request.get_json() or {}
        message = data.get("message")
        conversation_id = data.get("conversation_id")
        conversation_history = data.get("conversation_history") or []

        if not message:
            return jsonify({"error": "Message is required"}), 400

        user_id = _get_user_id()
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401

        if not conversation_id:
            conversation_id = create_new_conversation(user_id=user_id)

        # Save user message
        save_message(conversation_id, "user", message, user_id=user_id)

        # Generate assistant response
        result = generate_response(message, conversation_history)
        assistant_reply = result.get("response", "")

        if assistant_reply:
            save_message(conversation_id, "assistant", assistant_reply, user_id=user_id)

        payload = {
            "response": assistant_reply,
            "conversation_history": result.get("conversation_history", []),
            "conversation_id": conversation_id,
        }
        return jsonify(payload)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@chatbot_bp.route("/conversations", methods=["GET"])
@jwt_required()
def conversations_list():
    try:
        user_id = _get_user_id()
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401
        conversations = list_conversations(user_id=user_id)
        return jsonify({"conversations": conversations})
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@chatbot_bp.route("/conversations/<conversation_id>", methods=["GET"])
@jwt_required()
def conversation_get(conversation_id: str):
    try:
        user_id = _get_user_id()
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401
        conversation = get_conversation(conversation_id, user_id=user_id)
        if not conversation:
            return jsonify({"error": "Conversation not found"}), 404
        return jsonify(conversation)
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@chatbot_bp.route("/conversations/<conversation_id>", methods=["DELETE"])
@jwt_required()
def conversation_delete(conversation_id: str):
    try:
        user_id = _get_user_id()
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401
        ok = delete_conversation(conversation_id, user_id=user_id)
        if ok:
            return jsonify({"message": "Conversation deleted successfully"})
        return jsonify({"error": "Conversation not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@chatbot_bp.route("/conversations/<conversation_id>/title", methods=["PUT"])
@jwt_required()
def conversation_update_title(conversation_id: str):
    try:
        data = request.get_json() or {}
        title = data.get("title")
        if not title:
            return jsonify({"error": "Title is required"}), 400

        user_id = _get_user_id()
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401

        ok = update_conversation_title(conversation_id, title, user_id=user_id)
        if ok:
            return jsonify({"message": "Title updated successfully"})
        return jsonify({"error": "Conversation not found"}), 404
    except Exception as e:
        return jsonify({"error": str(e)}), 500


@chatbot_bp.route("/conversations/new", methods=["POST"])
@jwt_required()
def conversation_create():
    try:
        user_id = _get_user_id()
        if not user_id:
            return jsonify({"error": "Authentication required"}), 401
        conversation_id = create_new_conversation(user_id=user_id)
        return jsonify({"conversation_id": conversation_id})
    except Exception as e:
        return jsonify({"error": str(e)}), 500