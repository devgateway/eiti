<?php
/**
 * @file
 * Display a single Drupal page.
 *
 * The doctype, html, head and body tags are not in this template. Instead they
 * can be found in the html.tpl.php template in this directory.
 *
 * @var string $breadcrumb
 * @var bool $display_breadcrumb
 * @var string $tabs
 * @var bool $display_tabs
 * @var string $messages
 * @var string $main_content_classes
 * @var string $title
 * @var array $title_prefix
 * @var array $title_suffix
 * @var array $action_links
 * @var array $page
 */
?>

<header role="banner" class="main-header clearfix">
  <div class="main-header-inner clearfix">
    <?php print theme('header_logo'); ?>
    <?php print theme('header_items'); ?>
  </div>
</header>

<div class="main-content-wrapper clearfix">
  <nav role="navigation" class="main-navigation">
    <div class="main-navigation-inner">
      <?php print theme('main_navigation'); ?>
    </div>
  </nav>

  <section role="main" id="main-content" class="main-content">
    <div class="main-content-inner clearfix">
      <?php print render($browser_warnings); ?>

      <?php if ($breadcrumb && $display_breadcrumb): ?>
        <div class="breadcrumb-wrapper"><?php print $breadcrumb; ?></div>
      <?php endif; ?>

      <?php if (!empty($tabs['#primary']) && $display_tabs): ?>
        <div class="tabs-wrapper"><?php print render($tabs); ?></div>
      <?php endif; ?>

      <section class="messages-wrapper clearfix">
        <?php print $messages; ?>
      </section>

      <div class="clearfix <?php print $main_content_classes; ?>">
        <?php if ($title || $title_prefix || $title_suffix): ?>
          <div class="page-title-wrapper">
            <?php print render($title_prefix); ?>
            <?php if ($title): ?>
              <h1 class="page-title"><?php print $title; ?></h1>
            <?php endif; ?>
            <?php print render($title_suffix); ?>
          </div>
          <?php if ($action_links): ?><ul class="title-links action-links"><?php print render($action_links); ?></ul><?php endif; ?>
        <?php endif; ?>

        <?php print render($page['help']); ?>
        <?php print render($page['content']); ?>
      </div>
      <?php // print $feed_icons; ?>
    </div>
  </section>
</div>

<?php if (arg(0) != 'admin'): ?>
  <footer role="contentinfo" class="main-footer">
    <div class="main-footer-inner clearfix">
      <?php print theme('footer_items'); ?>
    </div>
  </footer>
<?php endif; ?>
