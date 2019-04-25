<?php

/**
 * @file
 * Articles.
 */
$plugin = array(
  'title' => t('Articles'),
  'description' => t('Article list.'),
  'category' => t('Widget Library'),
  'render callback'  => 'eiti_ctools_extra__articles__render',
  'edit form' => 'eiti_ctools_extra__articles__settings_form',
  'defaults' => array(
    'display' => 'default',
  ),
);

/**
 * Output function for articles.
 */
function eiti_ctools_extra__articles__render($subtype, $conf, $panel_args, $context) {
  $block['articles'] = array(
    '#type' => 'html_container',
    '#tag' => 'div',
    '#attributes' => array(
      'class' => array(
        'articles',
        'single-fluid-row-wrapper',
      ),
    ),
  );
  $block['articles']['title'] = array(
    '#theme' => 'html_tag',
    '#tag' => 'h2',
    '#value' => t('News, blog posts and events'),
    '#attributes' => array('class' => array('title'), 'id' => drupal_html_id('News, blog posts and events')),
    '#prefix' => '<div class="pane-title-wrapper">',
    '#suffix' => '</div>',
  );
  $display = isset($conf['display']) ? $conf['display'] : 'default';
  $block['articles']['list'] = array(
    '#theme' => 'html_tag',
    '#tag' => 'div',
    '#value' => views_embed_view('articles', $display),
    '#attributes' => array('class' => array('list')),
  );
  return (object) array(
    'content' => $block,
  );
}

/**
 * Settings form for articles.
 */
function eiti_ctools_extra__articles__settings_form($form, &$form_state) {
  $conf = $form_state['conf'];
  $cleanup_list = array(
    'override_title',
    'override_title_text',
    'override_title_heading',
    'override_title_markup',
  );
  foreach ($cleanup_list as $key) {
    if (isset($form[$key])) {
      $form[$key]['#access'] = FALSE;
    }
  }
  $form['display'] = array(
    '#title' => t('Display'),
    '#type' => 'select',
    '#options' => array(
      'default' => t('Full list with filters'),
      'latest' => t('Latest 6'),
    ),
    '#default_value' => $conf['display'],
  );
  $form['tags'] = array(
    '#title' => t('Tags'),
    '#type' => 'textfield',
    '#default_value' => $conf['tags'],
    '#autocomplete_path' => 'taxonomy/autocomplete/field_tags',
    '#description' => t('Limit the results to the entered tags.'),
  );
  return $form;
}

/**
 * Submit handler for article settings form.
 */
function eiti_ctools_extra__articles__settings_form_submit($form, &$form_state) {
  // Remove unneeded values.
  form_state_values_clean($form_state);
  foreach (element_children($form) as $key) {
    if (isset($form_state['values'][$key])) {
      $form_state['conf'][$key] = $form_state['values'][$key];
    }
  }
}