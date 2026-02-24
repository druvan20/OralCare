def fuse_predictions(image_prob, metadata_prob=None):
    """
    Simple weighted fusion
    """
    if metadata_prob is None:
        final_score = image_prob
    else:
        final_score = 0.7 * image_prob + 0.3 * metadata_prob

    decision = "Malignant" if final_score >= 0.5 else "Benign"

    return {
        "final_score": round(final_score, 3),
        "final_decision": decision
    }
