import json
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

_producer = None

def _get_producer():
    global _producer
    if _producer is None:
        from kafka import KafkaProducer
        _producer = KafkaProducer(
            bootstrap_servers=settings.KAFKA_BOOTSTRAP_SERVERS,
            value_serializer=lambda v: json.dumps(v, ensure_ascii=False).encode('utf-8'),
            request_timeout_ms=5000,
            max_block_ms=5000,
        )
    return _producer

def publish_event(event: dict) -> None:
    try:
        _get_producer().send(settings.KAFKA_TEST_DRIVE_TOPIC, event)
    except Exception as e:
        logger.error("Kafka publish failed: %s | event: %s", e, event)
