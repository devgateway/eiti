<?php

/**
 * @file
 * Contains EITIApiScoreData2.
 */

/**
 * Class EITIApiScoreData2
 */
class EITIApiScoreData2 extends EITIApiScoreData {
  public $summary_data;

  /**
   * Overrides RestfulDataProviderEFQ::__construct().
   */
  public function __construct(array $plugin, \RestfulAuthenticationManager $auth_manager = NULL, \DrupalCacheInterface $cache_controller = NULL, $language = NULL) {
    parent::__construct($plugin, $auth_manager, $cache_controller, $language);

    $this->summary_data = $this->getSummaryData();
  }

  /**
   * Overrides EITIApiScoreData::publicFieldsInfo().
   */
  public function publicFieldsInfo() {
    $public_fields = parent::publicFieldsInfo();

    $public_fields['country'] = array(
      'property' => 'country_id',
      'callback' => array($this, 'getCountryApiUrl'),
    );
    $public_fields['summary_data'] = array(
      'callback' => array($this, 'getSummaryDataId2'),
    );
    $public_fields['validation_date'] = array(
      // Should match with "latest_validation_date" in EITIApiImplementingCountry2.class.php.
      //'property' => 'published',
      'property' => 'field_scd_pdf_date',
      'process_callbacks' => array('eiti_api_timestamp_to_iso_8601_partial'),
    );
    $public_fields['overall_progress'] = array(
      'property' => 'field_scd_score_req_values',
      'process_callbacks' => array(array($this, 'getOverallProgress')),
    );

    // Re-order to the end.
    $score_req_values = $public_fields['score_req_values'];
    unset($public_fields['score_req_values']);
    $public_fields['score_req_values'] = $score_req_values;

    $public_fields['score_req_values']['process_callbacks'] = array(array($this, 'prepareScoreReqValues'));

    return $public_fields;
  }

  /**
   * A standard processing callback for score_req_values.
   */
  function prepareScoreReqValues($score_req_values) {
    foreach ($score_req_values as $key => $sr) {
      if (isset($score_req_values[$key]->score_req_id)) {
        unset($score_req_values[$key]->score_req_id);
        unset($score_req_values[$key]->value);
        $score_req_values[$key]->is_required = eiti_api_value_to_boolean($score_req_values[$key]->is_required);
        $score_req_values[$key]->is_applicable = eiti_api_value_to_boolean($score_req_values[$key]->is_applicable);
      }
      if (isset($score_req_values[$key]->score_req->type)) {
        $score_req_values[$key]->score_req->requirement = $score_req_values[$key]->score_req->code;
        unset($score_req_values[$key]->score_req->code);
        $scoreReqEmw = entity_metadata_wrapper('score_req', $sr->score_req);
        $category = $scoreReqEmw->field_score_req_category->value();
        $score_req_values[$key]->score_req->category = NULL;
        if ($category) {
          // Might have to get it from "name_field", but seems like it is not properly in use right now.
          $score_req_values[$key]->score_req->category = $category->name;
        }
        unset($score_req_values[$key]->score_req->field_score_req_category);
        unset($score_req_values[$key]->score_req->type);
        unset($score_req_values[$key]->score_req->status);
        unset($score_req_values[$key]->score_req->created);
      }
      // Overall progress is being displayed separately.
      if (isset($score_req_values[$key]->score_req->requirement) && $score_req_values[$key]->score_req->requirement == '0.0') {
        unset($score_req_values[$key]);
      }
    }
    return $score_req_values;
  }

  /**
   * Overrides RestfulBase::parseRequestForListFilter().
   */
  protected function parseRequestForListFilter() {
    $filters = parent::parseRequestForListFilter();
    foreach ($filters as $key => $filter) {
      // Country ISO to ID.
      if (isset($filter['public_field'], $filter['value'][0]) && $filter['public_field'] == 'country') {
        foreach ($filter['value'] as $k => $v) {
          $filters[$key]['value'][$k] = eitientity_implementing_country_get_id(strtoupper($v));
        }
      }
    }
    return $filters;
  }

  /**
   * Gets the implementing country API url.
   */
  function getCountryApiUrl($emw) {
    if (isset($emw->country_id)) {
      $country = $emw->country_id->value();
      if (isset($country->iso)) {
        return url('api/v2.0/implementing_country/' . $country->iso, array('absolute' => TRUE));
      }
    }
    return NULL;
  }

  /**
   * Gets the summary data ID2.
   */
  function getSummaryDataId2($emw) {
    if (isset($emw->country_id, $emw->year)) {
      $country_id = $emw->country_id->value()->id;
      $year = $emw->year->value();
      if (isset($this->summary_data[$country_id][$year])) {
        return $this->summary_data[$country_id][$year];
      }
    }
    return NULL;
  }

  /**
   * Gets summary data ID2-s for country and year combinations.
   */
  public function getSummaryData() {
    $query = db_select('eiti_summary_data', 'sd');
    $query->fields('sd', array('country_id', 'year_end', 'id2'));
    $query->condition('sd.status', 1);
    $results = $query->execute()->fetchAll();

    $summary_data = array();
    if (is_array($results)) {
      foreach ($results as $result) {
        $summary_data[$result->country_id][date('Y', $result->year_end)] = $result->id2;
      }
    }

    return $summary_data;
  }

  /**
   * Gets the overall progress score requirement value.
   */
  function getOverallProgress($score_req_values) {
    foreach ($score_req_values as $key => $sr) {
      if (isset($score_req_values[$key]->score_req->code) && $score_req_values[$key]->score_req->code == '0.0') {
        return $score_req_values[$key];
      }
      elseif (isset($score_req_values[$key]->score_req->requirement) && $score_req_values[$key]->score_req->requirement == '0.0') {
        return $score_req_values[$key];
      }
    }
    return NULL;
  }
}
