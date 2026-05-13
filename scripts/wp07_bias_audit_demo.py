#!/usr/bin/env python
import argparse
import json
from pathlib import Path

import numpy as np
import pandas as pd

AGE_BUCKETS = [(18, 29), (30, 49), (50, 65)]

def build_dataset(rows=1000):
    np.random.seed(42)
    races = ['White', 'Black', 'Asian', 'Hispanic']
    genders = ['Male', 'Female']
    ages = np.random.randint(18, 66, size=rows)
    race = np.random.choice(races, rows, p=[0.35, 0.25, 0.2, 0.2])
    gender = np.random.choice(genders, rows, p=[0.55, 0.45])
    score = np.clip(np.random.normal(loc=0.7, scale=0.18, size=rows), 0, 1)

    # Intentionally bias against Black female applicants over 50
    bias_mask = (race == 'Black') & (gender == 'Female') & (ages >= 50)
    score[bias_mask] = np.clip(score[bias_mask] - 0.18, 0, 1)

    # Moderate downward drift for Black and female groups
    score[(race == 'Black') & ~bias_mask] -= 0.08
    score[(gender == 'Female') & ~bias_mask] -= 0.06
    score = np.clip(score, 0, 1)

    return pd.DataFrame({
        'race': race,
        'gender': gender,
        'age': ages,
        'score': score,
    })


def bucket_age(age: int):
    for low, high in AGE_BUCKETS:
        if low <= age <= high:
            return f'{low}-{high}'
    return '65+'


def selection_rate(series: pd.Series, selected: pd.Series):
    grouped = selected.groupby(series).mean()
    return grouped.to_dict()


def find_eeoc_violations(rates: dict):
    if not rates:
        return []
    highest = max(rates.values())
    threshold = highest * 0.8
    return [group for group, rate in rates.items() if rate < threshold]


def format_summary(results: dict):
    summary = [
        f"Generated {results['row_count']} synthetic TalentMatch records.",
        f"Highest selection rate by race: {results['selection_rates']['race']['highest_group']} ({results['selection_rates']['race']['highest_rate']:.0%}).",
    ]
    if results['eeoc_violations']:
        summary.append(f"EEOC 4/5 violations detected for: {', '.join(results['eeoc_violations'])}.")
    else:
        summary.append('No EEOC 4/5 violations detected.')
    return ' '.join(summary)


def main():
    parser = argparse.ArgumentParser(description='Run a synthetic WP-07 bias audit demo.')
    parser.add_argument('--dataset', required=True, help='Dataset id (e.g. wp-07)')
    parser.add_argument('--output', required=True, help='Output JSON file path')
    args = parser.parse_args()

    df = build_dataset(1000)
    df['age_bucket'] = df['age'].apply(bucket_age)
    threshold = 0.6
    df['selected'] = df['score'] > threshold

    selection_rates = {
        'race': selection_rate(df['race'], df['selected']),
        'gender': selection_rate(df['gender'], df['selected']),
        'age_bucket': selection_rate(df['age_bucket'], df['selected']),
    }

    eeoc_violations = []
    for label, rates in selection_rates.items():
        grouped_rates = {str(k): float(v) for k, v in rates.items()}
        if grouped_rates:
            highest = max(grouped_rates.values())
            for group, rate in grouped_rates.items():
                if rate < highest * 0.8:
                    eeoc_violations.append(f'{label}:{group}')

    output = {
        'dataset': args.dataset,
        'row_count': int(len(df)),
        'threshold': threshold,
        'selection_rates': {
            'race': {k: float(v) for k, v in selection_rates['race'].items()},
            'gender': {k: float(v) for k, v in selection_rates['gender'].items()},
            'age_bucket': {k: float(v) for k, v in selection_rates['age_bucket'].items()},
        },
        'eeoc_violations': eeoc_violations,
    }

    output_path = Path(args.output)
    output_path.parent.mkdir(parents=True, exist_ok=True)
    output_path.write_text(json.dumps(output, indent=2))

    print('Bias audit demo complete.')
    print(f"Output written to {output_path}")
    print(format_summary({
        'row_count': output['row_count'],
        'selection_rates': {
            'race': {'highest_group': max(output['selection_rates']['race'], key=output['selection_rates']['race'].get), 'highest_rate': max(output['selection_rates']['race'].values())},
        },
        'eeoc_violations': output['eeoc_violations'],
    }))


if __name__ == '__main__':
    main()
