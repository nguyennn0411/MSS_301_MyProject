package com.sportbooking.booking.service;

import static org.springframework.http.HttpStatus.*;

import java.math.BigDecimal;
import java.net.http.HttpClient;
import java.time.Duration;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.cloud.client.loadbalancer.LoadBalanced;
import org.springframework.context.annotation.*;
import org.springframework.http.client.JdkClientHttpRequestFactory;
import org.springframework.stereotype.Component;
import org.springframework.web.client.*;
import org.springframework.web.server.ResponseStatusException;

@Component
public class CatalogClient {
  public record UserInfo(String id, boolean active) {}

  public record CourtInfo(String id, String name, BigDecimal hourlyRate, boolean active) {}

  private final RestClient client;

  public CatalogClient(@Qualifier("catalogRestClient") RestClient client) {
    this.client = client;
  }

  public UserInfo user(String id) {
    return get("http://user-service/api/users/{id}", id, UserInfo.class);
  }

  public CourtInfo court(String id) {
    return get("http://court-service/api/courts/{id}", id, CourtInfo.class);
  }

  private <T> T get(String url, String id, Class<T> type) {
    try {
      T result = client.get().uri(url, id).retrieve().body(type);
      if (result == null)
        throw new ResponseStatusException(SERVICE_UNAVAILABLE, "Service trả về dữ liệu rỗng.");
      return result;
    } catch (HttpClientErrorException.NotFound ex) {
      throw new ResponseStatusException(NOT_FOUND, "Không tìm thấy người dùng hoặc sân.");
    } catch (RestClientException | IllegalStateException ex) {
      throw new ResponseStatusException(
          SERVICE_UNAVAILABLE, "Không kết nối được User/Court Service. Vui lòng thử lại sau.");
    }
  }

  @Configuration
  static class ClientConfiguration {
    // Eureka calls its configured URL directly; it must not use the load-balanced builder.
    @Bean
    @Primary
    @Scope("prototype")
    RestClient.Builder restClientBuilder() {
      return RestClient.builder();
    }

    @Bean
    @LoadBalanced
    RestClient.Builder loadBalancedRestClientBuilder() {
      var factory =
          new JdkClientHttpRequestFactory(
              HttpClient.newBuilder().connectTimeout(Duration.ofSeconds(3)).build());
      factory.setReadTimeout(Duration.ofSeconds(5));
      return RestClient.builder().requestFactory(factory);
    }

    @Bean
    RestClient catalogRestClient(@LoadBalanced RestClient.Builder builder) {
      return builder.build();
    }
  }
}
